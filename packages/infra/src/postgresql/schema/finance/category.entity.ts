import { boolean, index, integer, pgTable, timestamp, uuid, varchar, AnyPgColumn } from "drizzle-orm/pg-core"
import { financeFamily } from "./family.entity"

export const financeCategory = pgTable(
  "fin_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // EXPENSE, INCOME
    parentId: uuid("parent_id").references((): AnyPgColumn => financeCategory.id),
    isHidden: boolean("is_hidden").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("fin_categories_family_id_idx").on(table.familyId),
    index("fin_categories_parent_id_idx").on(table.parentId),
  ],
)
