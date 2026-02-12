import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { financeFamily } from "./family.entity"

export const financeTag = pgTable(
  "fin_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 20 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("fin_tags_family_id_idx").on(table.familyId)],
)
