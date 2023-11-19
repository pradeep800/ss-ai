import { StackContext, Cron, Queue, Function, use } from "sst/constructs";
import { Secret } from "./Secret";

export function SendRemindersCron({ stack }: StackContext) {
  const secret = use(Secret);
  const queue = new Queue(stack, "DLQSendReminders", {
    consumer: "packages/functions/src/send-reminders-dlq.handler",
  });
  queue.bind([secret.RESEND_API_KEY]);
  const sendReminderFn = new Function(stack, "DLQSendRemindersFn", {
    handler: "packages/functions/src/send-reminders.handler",
    retryAttempts: 3,
    deadLetterQueue: queue.cdk.queue,
    bind: [secret.DATABASE_URL, secret.RESEND_API_KEY],
  });

  const emailReminderCron = new Cron(stack, "SendReminders", {
    job: sendReminderFn,
    schedule: "rate(3 hours)",
  });
  emailReminderCron.bind([secret.DATABASE_URL, secret.RESEND_API_KEY]);
}
