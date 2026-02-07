import { boolean, index, integer, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

export const adminModule = pgTable(
  "sys_admin_module",
  {
    moduleId: varchar("module_id", { length: 32 }).primaryKey().notNull(),
    parentId: varchar("parent_id", { length: 32 }).references(() => adminModule.moduleId, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
    name: varchar("name", { length: 80 }).notNull(),
    routePath: varchar("route_path", { length: 200 }).notNull(),
    permissionCode: varchar("permission_code", { length: 80 }).notNull(),
    sort: integer("sort").notNull().default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("sys_admin_module_route_path_uq").on(table.routePath),
    uniqueIndex("sys_admin_module_permission_code_uq").on(table.permissionCode),
    index("sys_admin_module_parent_id_idx").on(table.parentId),
    index("sys_admin_module_sort_idx").on(table.sort),
  ],
)
