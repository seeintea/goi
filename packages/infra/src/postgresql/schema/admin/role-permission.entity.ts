import { pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core"
import { adminPermission } from "./permission.entity"
import { adminRole } from "./role.entity"

export const adminRolePermission = pgTable(
  "admin_role_permission",
  {
    roleId: varchar("role_id", { length: 32 })
      .notNull()
      .references(() => adminRole.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: varchar("permission_id", { length: 32 })
      .notNull()
      .references(() => adminPermission.permissionId, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "admin_role_permission_pkey" })],
)
