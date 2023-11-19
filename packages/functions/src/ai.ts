import { db } from "@ss-ai/core/src/db/drizzle";
import { aiChatMessages } from "@ss-ai/core/src/db/schema";
import { openai } from "@ss-ai/core/src/utils/openai";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "sst/node/config";
import { ResponseStream, streamifyResponse, isInAWS } from "lambda-stream";
import { aiRouteValidator } from "@ss-ai/core/src/validator/ai-route";
import { userValidator } from "@ss-ai/core/src/validator/token-info";
import { StopStreaming } from "@ss-ai/core/src/utils/stop-streaming";
import { eq, and, desc } from "drizzle-orm";
import { Bucket } from "sst/node/bucket";
import { S3 } from "aws-sdk";
const previousConversationCount = 4;
const s3 = new S3();
import crypto from "crypto";
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
  const header = event["headers"]["authorization"].split(" ")[1];

  //check token info
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(header, Config.LAMBDA_SECRET);
  } catch (err) {
    return StopStreaming(responseStream, "unauthorized");
  }

  const validator = userValidator.safeParse(payload);
  if (!validator.success) {
    return StopStreaming(responseStream, "unauthorized");
  }
  const userInfo = validator.data;

  responseStream.setContentType("text/plain");

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
  previousConversations.reverse();

  //get question
  const params = {
    Bucket: Bucket.SS.bucketName,
    Key: `sheet-questions/${body.data.questionNumber}.txt`,
  };

  const object = await s3.getObject(params).promise();
  const question = object?.Body?.toString()
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
  try {
    const openAiStream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",

      stream: true,
      messages: [
        {
          role: "system",
          content: `You are DSA expert and you have question in context give answer to user only answer question regarding writing code and query regarding question which is in context and don't start by writing assistant or answer:`,
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
      if (typeof data === "string") {
        response += data;
        responseStream.write(data || "");
      }
    }
    await db.transaction(async (tx) => {
      await tx.insert(aiChatMessages).values({
        id: crypto.randomUUID(),
        question_no: body.data.questionNumber,
        userId: userInfo.id,
        message: body.data.message,
        sender: "USER",
        created_at: Date.now(),
      });
      await tx.insert(aiChatMessages).values({
        id: crypto.randomUUID(),
        question_no: body.data.questionNumber,
        userId: userInfo.id,
        message: response,

        sender: "AI",
        created_at: Date.now() + 4,
      });
    });
    responseStream.end();
  } catch (err) {
    console.log(err);
    return StopStreaming(responseStream, "Server Error");
  }
});
