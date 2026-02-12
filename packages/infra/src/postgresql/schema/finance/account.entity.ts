import { boolean, decimal, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { financeFamily } from "./family.entity"

export const financeAccount = pgTable(
  "fin_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // CASH, BANK, CREDIT, INVESTMENT, LOAN
    balance: decimal("balance", { precision: 18, scale: 2 }).notNull().default("0"),
    currencyCode: varchar("currency_code", { length: 10 }).notNull().default("CNY"),
    creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }),
    billingDay: integer("billing_day"),
    dueDay: integer("due_day"),
    excludeFromStats: boolean("exclude_from_stats").notNull().default(false),
    archived: boolean("archived").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("fin_accounts_family_id_idx").on(table.familyId)],
)
