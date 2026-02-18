import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { adminModule } from "./module.entity"
import { adminRole } from "./role.entity"

export const adminRoleModule = pgTable(
  "admin_role_module",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRole.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => adminModule.moduleId, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.moduleId], name: "admin_role_module_pkey" })],
)
