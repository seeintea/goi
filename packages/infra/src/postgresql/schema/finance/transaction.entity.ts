import { boolean, decimal, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"
import { financeAccount } from "./account.entity"
import { financeCategory } from "./category.entity"
import { financeFamily } from "./family.entity"

export const financeTransaction = pgTable(
  "fin_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => financeAccount.id, { onDelete: "restrict", onUpdate: "cascade" }),
    toAccountId: uuid("to_account_id").references(() => financeAccount.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
    categoryId: uuid("category_id").references(() => financeCategory.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
    amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // EXPENSE, INCOME, TRANSFER
    occurredAt: timestamp("occurred_at").notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => authUser.userId),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("fin_transactions_family_id_idx").on(table.familyId),
    index("fin_transactions_account_id_idx").on(table.accountId),
    index("fin_transactions_occurred_at_idx").on(table.occurredAt),
  ],
)
