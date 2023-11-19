import { SSTConfig } from "sst";
import { API } from "./stacks/AiStack";
import { Secret } from "./stacks/Secret";
import { RemoveSubscriptionsCron } from "./stacks/RemoveSubscriptions";
import { SendRemindersCron } from "./stacks/EmailReminders";
export default {
  config(_input) {
    return {
      name: "ss-ai",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app
      .stack(Secret)
      .stack(API)
      .stack(RemoveSubscriptionsCron)
      .stack(SendRemindersCron);
  },
} satisfies SSTConfig;

/// there are two stages one
//new
//prod
