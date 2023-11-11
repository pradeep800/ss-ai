import {
  int,
  mysqlEnum,
  varchar,
  timestamp,
  index,
  mysqlTableCreator,
} from "drizzle-orm/mysql-core";
const table = mysqlTableCreator((name) => `striver_sheet_${name}`);
export const aiChatMessages = table(
  "ai_chat_messages",
  {
    id: int("id").notNull().autoincrement().primaryKey(),
    question_no: int("question_no").notNull(),
    sender: mysqlEnum("sender", ["USER", "AI"]),
    userId: varchar("user_id", { length: 255 }).notNull(),
    message: varchar("message", { length: 1500 }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (chat) => ({ sheetIndex: index("userId_index").on(chat.userId) })
);
