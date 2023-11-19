import { StackContext, Cron, Queue, Function, use } from "sst/constructs";
import { Secret } from "./Secret";

export function RemoveSubscriptionsCron({ stack }: StackContext) {
  const secret = use(Secret);
  const queue = new Queue(stack, "DLQEmailSend", {
    consumer: "packages/functions/src/remove-subscriptions-dlq.handler",
  });
  queue.bind([secret.RESEND_API_KEY]);

  const reminderRemoveFn = new Function(stack, "DLQReminderSendFn", {
    handler: "packages/functions/src/remove-subscriptions.handler",
    retryAttempts: 3,
    deadLetterQueue: queue.cdk.queue,
    bind: [secret.DATABASE_URL, secret.RESEND_API_KEY],
  });

  const emailReminderCron = new Cron(stack, "EmailReminder", {
    job: reminderRemoveFn,
    schedule: "rate(3 hours)",
  });
  emailReminderCron.bind([secret.DATABASE_URL, secret.RESEND_API_KEY]);
}
