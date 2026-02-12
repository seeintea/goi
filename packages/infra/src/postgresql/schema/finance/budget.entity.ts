import { date, decimal, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { financeFamily } from "./family.entity"
import { financeCategory } from "./category.entity"

export const financeBudget = pgTable(
  "fin_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    categoryId: uuid("category_id").references(() => financeCategory.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
    periodType: varchar("period_type", { length: 20 }).notNull().default("MONTHLY"), // MONTHLY, YEARLY, ONE_OFF
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("fin_budgets_family_id_idx").on(table.familyId)],
)
