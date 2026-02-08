import { boolean, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

export const authRole = pgTable(
  "auth_role",
  {
    roleId: varchar("role_id", { length: 32 }).primaryKey().notNull(),
    roleCode: varchar("role_code", { length: 30 }).notNull(),
    roleName: varchar("role_name", { length: 50 }).notNull(),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("auth_role_role_code_uq").on(table.roleCode)],
)
