import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { authPermission } from "./permission.entity"
import { authRole } from "./role.entity"

export const authRolePermission = pgTable(
  "auth_role_permission",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => authRole.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => authPermission.permissionId, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "auth_role_permission_pkey" })],
)
