import { adminModule } from "./admin/module.entity"
import { adminPermission } from "./admin/permission.entity"
import { adminRole } from "./admin/role.entity"
import { adminRolePermission } from "./admin/role-permission.entity"
import { adminUser } from "./admin/user.entity"
import { authModule } from "./auth/module.entity"
import { authPermission } from "./auth/permission.entity"
import { authRole } from "./auth/role.entity"
import { authRolePermission } from "./auth/role-permission.entity"
import { authUser } from "./auth/user.entity"
import { financeBook } from "./finance/book.entity"
import { financeBookMember } from "./finance/book-member.entity"

export const schema = {
  adminUser,
  adminModule,
  adminPermission,
  adminRole,
  adminRolePermission,
  authUser,
  authRole,
  authPermission,
  authRolePermission,
  authModule,
  financeBook,
  financeBookMember,
}

export type Schema = typeof schema
export type SchemaName = keyof Schema
