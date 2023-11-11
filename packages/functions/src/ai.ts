import { db } from "@ss-ai/core/db/drizzle";
import { aiChatMessages } from "@ss-ai/core/db/schema";
import fs from "fs";
import { openai } from "@ss-ai/core/src/openai";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "sst/node/config";
import { ResponseStream, streamifyResponse, isInAWS } from "lambda-stream";
import { aiRouteValidator } from "@ss-ai/core/validator/ai-route";
import { userValidator } from "@ss-ai/core/validator/token-info";
import { StopStreaming } from "@ss-ai/core/src/stop-streaming";
import { eq, and, desc } from "drizzle-orm";
const previousConversationCount = 4;

const metadata = {
  statusCode: 200,
  headers: {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
};
export const handler = streamifyResponse(async function (
  event,
  responseStream
) {
  // check authorization header
  if (
    !("authorization" in event["headers"]) ||
    typeof event["headers"]["authorization"] !== "string"
  ) {
    return StopStreaming(responseStream, "unauthorized");
  }

  //check token info
  const header = event["headers"]["authorization"].split(" ")[1];

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(header, Config.AI_JWT_SECRET);
  } catch (err) {
    return StopStreaming(responseStream, "unauthorized");
  }
  const validator = userValidator.safeParse(payload);
  if (!validator.success) {
    return StopStreaming(responseStream, "unauthorized");
  }
  const userInfo = validator.data;
  // check if awslmabda is present
  if ("awslambda" in global && typeof global.awslambda === "object") {
    // @ts-ignore
    const rs = global.awslambda.HttpResponseStream.from(
      responseStream,
      metadata
    );

    responseStream = rs as ResponseStream;
  } else {
    responseStream.setContentType("text/plain");
  }
  // parse body information
  if (!event.body) {
    return StopStreaming(responseStream, "Server Error");
  }

  const objectBody = JSON.parse(event.body);
  const body = aiRouteValidator.safeParse(objectBody);

  if (!body.success) {
    return StopStreaming(responseStream, "Server Error");
  }

  //fetch previous conversation
  const previousConversations = await db
    .select({
      message: aiChatMessages.message,
      sender: aiChatMessages.sender,
    })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.question_no, body.data.questionNumber),
        eq(aiChatMessages.userId, userInfo.id)
      )
    )
    .orderBy(desc(aiChatMessages.created_at))
    .limit(previousConversationCount);
  console.log(previousConversations);
  previousConversations.reverse();

  //get question
  const question = fs
    .readFileSync(`./sheet-questions/${body.data.questionNumber}.txt`)
    .toString()
    .replace(/(\r\n|\n|\r)/gm, " ")
    .trim();

  //content

  const content = `
Question:
${question}
Previous Conversation:
${previousConversations.map((message) => {
  if (message.sender === "USER") return `User: ${message.message}\n`;
  return `Assistant: ${message.message}\n`;
})}
User: ${body.data.message}?
`;
  console.log(content);
  try {
    const openAiStream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are DSA expert and you have question in context and give answer in markdown syntex and write small response`,
        },
        {
          role: "user",
          content: content,
        },
      ],
    });
    let response = "";
    for await (const chunk of openAiStream) {
      const data = chunk.choices[0]?.delta.content;
      console.log(data);
      if (typeof data === "string") {
        response += data;
        responseStream.write(chunk.choices[0]?.delta?.content || "");
      }
    }
    console.log(response);
    await db.transaction(async (tx) => {
      await tx.insert(aiChatMessages).values({
        question_no: body.data.questionNumber,
        userId: userInfo.id,
        message: body.data.message,
        sender: "USER",
      });
      await tx.insert(aiChatMessages).values({
        question_no: body.data.questionNumber,
        userId: userInfo.id,
        message: response,
        sender: "AI",
      });
    });
    responseStream.end();
  } catch (err) {
    return StopStreaming(responseStream, "Server Error");
  }
});
