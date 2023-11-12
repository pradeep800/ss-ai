import { Config, StackContext } from "sst/constructs";
export function Secret(ctx: StackContext) {
  return {
    DATABASE_URL: new Config.Secret(ctx.stack, "DATABASE_URL"),
    OPENAI_KEYS: new Config.Secret(ctx.stack, "OPENAI_KEYS"),
    AI_JWT_SECRET: new Config.Secret(ctx.stack, "AI_JWT_SECRET"),
    RESEND_API_KEY: new Config.Secret(ctx.stack, "RESEND_API_KEY"),
  };
}
