import type { PageQuery, PageResult } from "@goi/contracts"
import { api } from "../../client"

export type AppRolePermission = {
  roleId: string
  permissionId: string
  createTime: string
}

export type CreateAppRolePermission = {
  roleId: string
  permissionId: string
}

export type AppRolePermissionListQuery = PageQuery & {
  roleId?: string
  permissionId?: string
}

export const createAppRolePermission = (body: CreateAppRolePermission) =>
  api.post<AppRolePermission>("/api/app/role-permission/create", body)

export const findAppRolePermission = (roleId: string, permissionId: string) =>
  api.get<AppRolePermission>("/api/app/role-permission/find", { roleId, permissionId })

export const listAppRolePermissions = (query?: AppRolePermissionListQuery) =>
  api.get<PageResult<AppRolePermission>>("/api/app/role-permission/list", query)

export const deleteAppRolePermission = (body: CreateAppRolePermission) =>
  api.post<boolean>("/api/app/role-permission/delete", body)
