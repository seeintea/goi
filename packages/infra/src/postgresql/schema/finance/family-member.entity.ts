import { index, pgTable, timestamp, varchar, uuid, unique } from "drizzle-orm/pg-core"
import { authUser } from "../auth/user.entity"
import { financeFamily } from "./family.entity"
import { authRole } from "../auth/role.entity"

export const financeFamilyMember = pgTable(
  "fin_family_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => financeFamily.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => authUser.userId, { onDelete: "cascade", onUpdate: "cascade" }),
    roleId: varchar("role_id", { length: 32 })
      .notNull()
      .references(() => authRole.roleId, { onDelete: "restrict", onUpdate: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"), // INVITED, ACTIVE, DISABLED
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => [
    index("fin_family_members_family_id_idx").on(table.familyId),
    index("fin_family_members_user_id_idx").on(table.userId),
    unique("fin_family_members_family_user_uniq").on(table.familyId, table.userId),
  ],
)
