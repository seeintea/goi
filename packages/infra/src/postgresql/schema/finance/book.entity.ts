import { boolean, index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"

export const financeBook = pgTable(
  "finance_book",
  {
    bookId: varchar("book_id", { length: 32 }).primaryKey().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Shanghai"),
    ownerUserId: varchar("owner_user_id", { length: 32 })
      .notNull()
      .references(() => authUser.userId, { onDelete: "restrict", onUpdate: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("finance_book_owner_user_id_idx").on(table.ownerUserId)],
)
