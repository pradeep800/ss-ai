import { db } from "@ss-ai/core/src/db/drizzle";
import { users } from "@ss-ai/core/src/db/schema";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { ApiHandler } from "sst/node/api";
export const runtime = "edge";
export const revalidate = 0;
export const handler = ApiHandler(async (event) => {
  const todayDate = new Date();

  await db
    .update(users)
    .set({ role: "USER" })
    .where(
      and(
        eq(users.role, "PROUSER"),
        and(
          lt(users.pro_subscription_end, todayDate),
          isNotNull(users.pro_subscription_end)
        )
      )
    );
  console.log(
    new Date().toISOString() + " successfully removed pro subscription"
  );
});
