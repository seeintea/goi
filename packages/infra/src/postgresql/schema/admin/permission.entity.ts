import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"
import { adminModule } from "./module.entity"

export const adminPermission = pgTable(
  "admin_permission",
  {
    permissionId: uuid("permission_id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 80 }).notNull().default(""),
    moduleId: uuid("module_id")
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
