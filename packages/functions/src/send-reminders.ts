import { db } from "@ss-ai/core/src/db/drizzle";
import { resend } from "@ss-ai/core/src/utils/resend";
import { reminders, users } from "@ss-ai/core/src/db/schema";
import { eq, sql, or } from "drizzle-orm";
import EmailReminder from "@ss-ai/core/src/email-templates/reminder";

import { ssQuestions } from "@ss-ai/core/src/static/striver-sheet";

import { getIndianTime } from "@ss-ai/core/src/utils/basic";
export const handler = async () => {
  const resendIds: string[] = [];
  const proUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(or(eq(users.role, "PROUSER"), eq(users.role, "ADMIN")));

  //traverse through user (admin/pro user) and send them mail
  for (let i = 0; i < proUsers.length; i++) {
    const user = proUsers[i];
    //get all reminder of this user
    const allReminderOfThisAdmin = await db
      .select({
        reminderId: reminders.id,
        questionNo: reminders.question_no,
        due_date: reminders.due_date,
      })
      .from(reminders)
      .where(
        sql`${reminders.user_id}=${user.id} and ${
          reminders.should_send_mail
        }=${true} and ${reminders.mail_sended}=${false}`
      )
      .orderBy(reminders.question_no);

    const reminderWhichHaveTodayDate = allReminderOfThisAdmin.filter(
      (reminder) => {
        const { day: reminderDay, month: reminderMonth } = getIndianTime(
          reminder.due_date.toISOString()
        );
        const { day: todayDay, month: todayMonth } = getIndianTime();

        return reminderDay === todayDay && todayMonth === reminderMonth;
      }
    );

    const questionInfo = reminderWhichHaveTodayDate.map((reminderInfo) => {
      const question = ssQuestions[reminderInfo.questionNo - 1];
      return {
        questionNo: reminderInfo.questionNo,
        title: question.problem,
        day: question.topicNo + 1,
      };
    });
    if (!questionInfo.length) {
      continue;
    }

    const emailResponse = await resend.emails.send({
      from: "reminders@pradeepbisht.com",
      to: user.email,
      subject: "Reminders",
      html: EmailReminder({
        questionsInfo: questionInfo,
      }),
      headers: {
        "X-Entity-Ref-ID": Date.now().toString(),
      },
    });
    if (emailResponse.error) {
      throw new Error(emailResponse.error.message);
    } else {
      resendIds.push(emailResponse.data?.id ?? "");
    }

    const markingReminderSended: any[] = [];
    //mark mail send
    reminderWhichHaveTodayDate.map((reminder) => {
      markingReminderSended.push(
        db
          .update(reminders)
          .set({ mail_sended: true })
          .where(eq(reminders.id, reminder.reminderId))
      );
    });
    await Promise.all(markingReminderSended);
  }

  console.log("ids of resend ", resendIds);
  console.log(
    "successfully sended reminders to all pro users on ",
    new Date().toISOString()
  );
};
