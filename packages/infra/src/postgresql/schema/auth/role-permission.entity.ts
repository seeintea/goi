import { pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core"
import { authPermission } from "./permission.entity"
import { authRole } from "./role.entity"

export const authRolePermission = pgTable(
  "auth_role_permission",
  {
    roleId: varchar("role_id", { length: 32 })
      .notNull()
      .references(() => authRole.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: varchar("permission_id", { length: 32 })
      .notNull()
      .references(() => authPermission.permissionId, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "auth_role_permission_pkey" })],
)
