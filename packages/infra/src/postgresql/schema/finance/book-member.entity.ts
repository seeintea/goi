import { boolean, index, jsonb, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"
import { financeBook } from "./book.entity"

export const financeBookMember = pgTable(
  "finance_book_member",
  {
    memberId: varchar("member_id", { length: 32 }).primaryKey().notNull(),
    bookId: varchar("book_id", { length: 32 })
      .notNull()
      .references(() => financeBook.bookId, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => authUser.userId, { onDelete: "restrict", onUpdate: "cascade" }),
    roleCode: varchar("role_code", { length: 20 }).notNull(),
    scopeType: varchar("scope_type", { length: 20 }).notNull().default("all"),
    scope: jsonb("scope").notNull().default({}),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("finance_book_member_book_user_uq").on(table.bookId, table.userId),
    index("finance_book_member_user_id_idx").on(table.userId),
  ],
)
