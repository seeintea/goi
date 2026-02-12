import { index, pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"

export const financeFamily = pgTable(
  "fin_families",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(),
    ownerUserId: varchar("owner_user_id", { length: 32 })
      .notNull()
      .references(() => authUser.userId, { onDelete: "restrict", onUpdate: "cascade" }),
    baseCurrency: varchar("base_currency", { length: 10 }).notNull().default("CNY"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Shanghai"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("fin_families_owner_user_id_idx").on(table.ownerUserId)],
)
