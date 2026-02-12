import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { financeTransaction } from "./transaction.entity"
import { financeTag } from "./tag.entity"

export const financeTransactionTag = pgTable(
  "fin_transaction_tags",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => financeTransaction.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => financeTag.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })],
)
