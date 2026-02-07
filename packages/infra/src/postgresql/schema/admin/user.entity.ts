import { boolean, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

export const adminUser = pgTable(
  "sys_admin_user",
  {
    userId: varchar("user_id", { length: 32 }).primaryKey().notNull(),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 100 }).notNull(),
    salt: varchar("salt", { length: 16 }).notNull(),
    email: varchar("email", { length: 50 }).notNull().default(""),
    phone: varchar("phone", { length: 11 }).notNull().default(""),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("sys_admin_user_username_uq").on(table.username)],
)
