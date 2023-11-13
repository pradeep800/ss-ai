import { StackContext, Cron, Queue, Function, use } from "sst/constructs";
import { Secret } from "./Secret";

export function SendRemindersCron({ stack }: StackContext) {
  const secret = use(Secret);
  const queue = new Queue(stack, "DLQSendReminders", {
    consumer: "packages/functions/src/send-reminders-dlq.handler",
  });

  const fn = new Function(stack, "DLQSendRemindersFn", {
    handler: "packages/functions/src/send-reminders.handler",
    retryAttempts: 1,
    deadLetterQueue: queue.cdk.queue,
    bind: [secret.DATABASE_URL, secret.RESEND_API_KEY],
  });

  const emailReminderCron = new Cron(stack, "SendReminders", {
    job: "packages/functions/src/send-reminders.handler",
    schedule: "rate(1 hour)",
  });
  emailReminderCron.bind([secret.DATABASE_URL, secret.RESEND_API_KEY]);
}
