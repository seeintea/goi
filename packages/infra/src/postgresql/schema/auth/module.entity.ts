import { boolean, index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

export const authModule = pgTable(
  "auth_module",
  {
    moduleId: uuid("module_id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references(() => authModule.moduleId, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
    name: varchar("name", { length: 80 }).notNull(),
    routePath: varchar("route_path", { length: 200 }).notNull(),
    permissionCode: varchar("permission_code", { length: 80 }).notNull(),
    sort: integer("sort").notNull().default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("auth_module_route_path_uq").on(table.routePath),
    uniqueIndex("auth_module_permission_code_uq").on(table.permissionCode),
    index("auth_module_parent_id_idx").on(table.parentId),
    index("auth_module_sort_idx").on(table.sort),
  ],
)
