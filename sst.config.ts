import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";
import { Secret } from "./stacks/Secret";

export default {
  config(_input) {
    return {
      name: "ss-ai",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(Secret).stack(API);
  },
} satisfies SSTConfig;
//NEXT_SECRET DATABASE_URL OPENAI_KEYS
