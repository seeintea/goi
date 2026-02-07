import { adminModule } from "./admin/module.entity"
import { adminPermission } from "./admin/permission.entity"
import { adminRole } from "./admin/role.entity"
import { adminRolePermission } from "./admin/role-permission.entity"
import { adminUser } from "./admin/user.entity"
import { book } from "./app/book.entity"
import { bookMember } from "./app/book-member.entity"
import { sysModule } from "./app/module.entity"
import { permission } from "./app/permission.entity"
import { role } from "./app/role.entity"
import { rolePermission } from "./app/role-permission.entity"
import { user } from "./app/user.entity"

export const schema = {
  adminUser,
  adminModule,
  adminPermission,
  adminRole,
  adminRolePermission,
  book,
  bookMember,
  sysModule,
  permission,
  role,
  rolePermission,
  user,
}

export type Schema = typeof schema
export type SchemaName = keyof Schema
