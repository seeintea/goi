import { boolean, index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { user } from "./user.entity"

export const book = pgTable(
  "ff_book",
  {
    bookId: varchar("book_id", { length: 32 }).primaryKey().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Shanghai"),
    ownerUserId: varchar("owner_user_id", { length: 32 })
      .notNull()
      .references(() => user.userId, { onDelete: "restrict", onUpdate: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("ff_book_owner_user_id_idx").on(table.ownerUserId)],
)

