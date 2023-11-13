import { SQSEvent } from "aws-lambda";
import { resend } from "@ss-ai/core/src/utils/resend";
export const handler = async function (event: SQSEvent) {
  console.log("Unable to perform Cron for Remove subscription");
  const data = await resend.emails.send({
    from: "alert@pradeepbisht.com",
    to: ["pradeep8b0@gmail.com"],
    subject: "Cron Job Fail For Subscriptions",
    headers: {
      "X-Entity-Ref-ID": Date.now().toString(),
    },
    html: `<h1>Cron Job Fail To Remove Subscription at ${new Date().toISOString()}</h1> `,
  });
};
