import { StackContext, Api, use } from "sst/constructs";
import { Secret } from "./Secret";

export function API({ stack }: StackContext) {
  const secret = use(Secret);
  const api = new Api(stack, "api", {
    cors: {
      allowMethods: ["POST"],
      allowHeaders: ["Authorization"],
    },
    accessLog: true,
    defaults: {
      function: {
        bind: [secret.DATABASE_URL, secret.OPENAI_KEYS, secret.AI_JWT_SECRET],
      },
    },

    routes: {
      "POST /": "packages/functions/src/ai.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
