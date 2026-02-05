import { book } from "./book.entity"
import { bookMember } from "./book-member.entity"
import { sysModule } from "./module.entity"
import { permission } from "./permission.entity"
import { role } from "./role.entity"
import { rolePermission } from "./role-permission.entity"
import { user } from "./user.entity"

export const schema = {
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
