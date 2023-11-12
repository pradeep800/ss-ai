import { StackContext, Api, use, Bucket, Function } from "sst/constructs";
import { Secret } from "./Secret";

export function API({ stack }: StackContext) {
  const secret = use(Secret);
  const bucket = new Bucket(stack, "SS", {
    cors: [
      {
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT"],
      },
    ],
  });

  const aiFunction = new Function(stack, "Ai", {
    handler: "packages/functions/src/ai.handler",
    timeout: 60,
    memorySize: 512,
    bind: [
      bucket,
      secret.DATABASE_URL,
      secret.OPENAI_KEYS,
      secret.AI_JWT_SECRET,
    ],
    url: { cors: { allowHeaders: ["*"], allowOrigins: ["*"] } },
  });

  stack.addOutputs({
    Function: aiFunction.url,
  });
}
