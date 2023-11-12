import {
  int,
  mysqlEnum,
  varchar,
  timestamp,
  index,
  mysqlTableCreator,
  boolean,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
const table = mysqlTableCreator((name) => `striver_sheet_${name}`);
const role_enum = mysqlEnum("role", ["USER", "PROUSER", "ADMIN"]);
export const users = table(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified"),
    image: varchar("image", { length: 255 }),
    role: role_enum.default("USER").notNull(),
    userName: varchar("user_name", { length: 15 }).notNull(),
    leftProfileChanges: int("left_profile_changes").notNull().default(2),
    description: varchar("description", { length: 205 }),

    default_should_send_email: boolean("default_should_send_email")
      .default(false)
      .notNull(),
    stripe_customer_id: varchar("stripe_customer_id", { length: 255 }),
    stripe_subscription_id: varchar("stripe_subscription_id", { length: 255 }),
    stripe_price_id: varchar("stripe_price_id", { length: 255 }),
    pro_subscription_end: timestamp("pro_subscription_end"),

    striver_sheet_id_30_days: varchar("striver_sheet_id_30_days", {
      length: 255,
    }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow().onUpdateNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (user) => ({
    emailIndex: uniqueIndex("users__email__idx").on(user.email),
  })
);
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
export const reminders = table(
  "reminders",
  {
    id: int("id").notNull().autoincrement().primaryKey(),

    created_at: timestamp("created_at").defaultNow(),
    due_date: timestamp("due_time").notNull(),
    should_send_mail: boolean("should_send_mail").notNull(),
    mail_sended: boolean("mail_sended").default(false).notNull(),
    user_id: varchar("user_id", {
      length: 255,
    }).notNull(),

    question_no: int("question_no").notNull(),
  },
  (reminder) => ({
    ReminderCreatorIdIndex: index("reminder_creator_id_index").on(
      reminder.user_id
    ),
  })
);
