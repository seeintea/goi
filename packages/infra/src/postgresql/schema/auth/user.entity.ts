import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

export const authUser = pgTable(
  "auth_user",
  {
    userId: uuid("user_id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 30 }).notNull(),
    nickname: varchar("nickname", { length: 50 }).notNull().default("用户"),
    password: varchar("password", { length: 100 }).notNull(),
    salt: varchar("salt", { length: 16 }).notNull(),
    email: varchar("email", { length: 50 }).notNull().default(""),
    phone: varchar("phone", { length: 11 }).notNull().default(""),
    isVirtual: boolean("is_virtual").notNull().default(false),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("auth_user_username_uq").on(table.username)],
)
