import type {
  AdminPermission,
  CreateAdminPermission,
  PageQuery,
  PageResult,
  UpdateAdminPermission,
} from "@goi/contracts"
import { api } from "../../client"

export type AdminPermissionListQuery = PageQuery & {
  code?: string
  moduleId?: string
}

export const createAdminPermission = (body: CreateAdminPermission) =>
  api.post<AdminPermission>("/api/admin/permission/create", body)

export const findAdminPermission = (permissionId: string) =>
  api.get<AdminPermission>("/api/admin/permission/find", { permissionId })

export const listAdminPermissions = (query?: AdminPermissionListQuery) =>
  api.get<PageResult<AdminPermission>>("/api/admin/permission/list", query)

export const updateAdminPermission = (body: UpdateAdminPermission) =>
  api.post<AdminPermission>("/api/admin/permission/update", body)

export const deleteAdminPermission = (permissionId: string) =>
  api.post<boolean>("/api/admin/permission/delete", { permissionId })
