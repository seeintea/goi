import { boolean, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { adminModule } from "./module.entity"

export const adminPermission = pgTable(
  "admin_permission",
  {
    permissionId: varchar("permission_id", { length: 32 }).primaryKey().notNull(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 80 }).notNull().default(""),
    moduleId: varchar("module_id", { length: 32 })
      .notNull()
      .default("")
      .references(() => adminModule.moduleId, { onDelete: "restrict", onUpdate: "cascade" }),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("admin_permission_code_uq").on(table.code)],
)
