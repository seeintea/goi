export * from "./admin/module.entity"
export * from "./admin/permission.entity"
export * from "./admin/role.entity"
export * from "./admin/role-module.entity"
export * from "./admin/role-permission.entity"
export * from "./admin/user.entity"
export * from "./auth/module.entity"
export * from "./auth/permission.entity"
export * from "./auth/role.entity"
export * from "./auth/role-module.entity"
export * from "./auth/role-permission.entity"
export * from "./auth/user.entity"
export * from "./finance/account.entity"
export * from "./finance/budget.entity"
export * from "./finance/category.entity"
export * from "./finance/family.entity"
export * from "./finance/family-member.entity"
export * from "./finance/tag.entity"
export * from "./finance/transaction.entity"
export * from "./finance/transaction-tag.entity"
export * from "./system/audit-log.entity"

import { adminModule } from "./admin/module.entity"
import { adminPermission } from "./admin/permission.entity"
import { adminRole } from "./admin/role.entity"
import { adminRoleModule } from "./admin/role-module.entity"
import { adminRolePermission } from "./admin/role-permission.entity"
import { adminUser } from "./admin/user.entity"
import { authModule } from "./auth/module.entity"
import { authPermission } from "./auth/permission.entity"
import { authRole } from "./auth/role.entity"
import { authRoleModule } from "./auth/role-module.entity"
import { authRolePermission } from "./auth/role-permission.entity"
import { authUser } from "./auth/user.entity"
import { financeAccount } from "./finance/account.entity"
import { financeBudget } from "./finance/budget.entity"
import { financeCategory } from "./finance/category.entity"
import { financeFamily } from "./finance/family.entity"
import { financeFamilyMember } from "./finance/family-member.entity"
import { financeTag } from "./finance/tag.entity"
import { financeTransaction } from "./finance/transaction.entity"
import { financeTransactionTag } from "./finance/transaction-tag.entity"
import { sysAuditLog } from "./system/audit-log.entity"

export const schema = {
  // admin
  adminUser,
  adminModule,
  adminPermission,
  adminRole,
  adminRoleModule,
  adminRolePermission,
  authUser,
  authRole,
  authPermission,
  authRoleModule,
  authRolePermission,
  authModule,
  financeAccount,
  financeBudget,
  financeCategory,
  financeFamilyMember,
  financeFamily,
  financeTag,
  financeTransactionTag,
  financeTransaction,
  sysAuditLog,
}

export type Schema = typeof schema
export type SchemaName = keyof Schema
