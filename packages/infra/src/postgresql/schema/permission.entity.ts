import { boolean, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { sysModule } from "./module.entity"

export const permission = pgTable(
  "sys_permission",
  {
    permissionId: varchar("permission_id", { length: 32 }).primaryKey().notNull(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 80 }).notNull().default(""),
    moduleId: varchar("module_id", { length: 32 })
      .notNull()
      .default("")
      .references(() => sysModule.moduleId, { onDelete: "restrict", onUpdate: "cascade" }),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createTime: timestamp("create_time").notNull().defaultNow(),
    updateTime: timestamp("update_time")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("sys_permission_code_uq").on(table.code)],
)
