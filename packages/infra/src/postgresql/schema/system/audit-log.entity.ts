import { index, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"
import { financeFamily } from "../finance/family.entity"

export const sysAuditLog = pgTable(
  "sys_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 32 }).references(() => authUser.userId),
    familyId: uuid("family_id").references(() => financeFamily.id),
    action: varchar("action", { length: 50 }).notNull(),
    targetEntity: varchar("target_entity", { length: 50 }).notNull(),
    targetId: varchar("target_id", { length: 50 }).notNull(),
    changes: jsonb("changes"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("sys_audit_log_user_id_idx").on(table.userId),
    index("sys_audit_log_family_id_idx").on(table.familyId),
    index("sys_audit_log_target_entity_target_id_idx").on(table.targetEntity, table.targetId),
  ],
)
