import { boolean, index, jsonb, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { book } from "./book.entity"
import { user } from "./user.entity"

export const bookMember = pgTable(
  "ff_book_member",
  {
    memberId: varchar("member_id", { length: 32 }).primaryKey().notNull(),
    bookId: varchar("book_id", { length: 32 })
      .notNull()
      .references(() => book.bookId, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => user.userId, { onDelete: "restrict", onUpdate: "cascade" }),
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
    uniqueIndex("ff_book_member_book_user_uq").on(table.bookId, table.userId),
    index("ff_book_member_user_id_idx").on(table.userId),
  ],
)

