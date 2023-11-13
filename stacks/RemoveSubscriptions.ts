import { StackContext, Cron, Queue, Function, use } from "sst/constructs";
import { Secret } from "./Secret";

export function RemoveSubscriptionsCron({ stack }: StackContext) {
  const secret = use(Secret);
  const queue = new Queue(stack, "DLQEmailSend", {
    consumer: "packages/functions/src/remove-subscriptions-dlq.handler",
  });

  const fn = new Function(stack, "DLQReminderSendFn", {
    handler: "packages/functions/src/remove-subscriptions.handler",
    retryAttempts: 1,
    deadLetterQueue: queue.cdk.queue,
    bind: [secret.DATABASE_URL, secret.RESEND_API_KEY],
  });

  const emailReminderCron = new Cron(stack, "EmailReminder", {
    job: "packages/functions/src/remove-subscriptions.handler",
    schedule: "rate(1 hour)",
  });
  emailReminderCron.bind([secret.DATABASE_URL, secret.RESEND_API_KEY]);
}
