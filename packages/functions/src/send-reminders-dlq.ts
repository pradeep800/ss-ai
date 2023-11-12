import { SQSEvent } from "aws-lambda";
import { resend } from "@ss-ai/core/src/utils/resend";
export const handler = async function (event: SQSEvent) {
  console.log(
    "Unable to perform Cron for Sending Email " + new Date().toISOString()
  );
  const data = await resend.emails.send({
    from: "alert@pradeepbisht.com",
    to: ["pradeep8b0@gmail.com"],
    subject: "Cron Job Fail",
    html: "<h1>Cron Job Fail for email reminder</h1>",
  });
};
