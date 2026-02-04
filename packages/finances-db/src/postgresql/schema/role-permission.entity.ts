import { pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core"
import { permission } from "./permission.entity"
import { role } from "./role.entity"

export const rolePermission = pgTable(
  "sys_role_permission",
  {
    roleId: varchar("role_id", { length: 32 })
      .notNull()
      .references(() => role.roleId, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: varchar("permission_id", { length: 32 })
      .notNull()
      .references(() => permission.permissionId, { onDelete: "cascade", onUpdate: "cascade" }),
    createTime: timestamp("create_time").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "sys_role_permission_pkey" })],
)

