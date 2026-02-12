import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

export const adminRole = pgTable(
  "admin_role",
  {
    roleId: uuid("role_id").primaryKey().defaultRandom(),
    roleCode: varchar("role_code", { length: 30 }).notNull(),
    roleName: varchar("role_name", { length: 50 }).notNull(),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("admin_role_role_code_uq").on(table.roleCode)],
)
