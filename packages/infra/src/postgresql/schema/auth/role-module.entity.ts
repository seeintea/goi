import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { authModule } from "./module.entity"
import { authRole } from "./role.entity"

export const authRoleModule = pgTable(
  "auth_role_module",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => authRole.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => authModule.moduleId, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.moduleId], name: "auth_role_module_pkey" })],
)
