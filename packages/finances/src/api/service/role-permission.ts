import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../client"

export type RolePermission = {
  roleId: string
  permissionId: string
  createTime: string
}

export type CreateRolePermission = {
  roleId: string
  permissionId: string
}

export type RolePermissionListQuery = PageQuery & {
  roleId?: string
  permissionId?: string
}

export const createRolePermission = (body: CreateRolePermission) =>
  api.post<RolePermission>("/api/sys/role-permission/create", body)

export const findRolePermission = (roleId: string, permissionId: string) =>
  api.get<RolePermission>("/api/sys/role-permission/find", { roleId, permissionId })

export const listRolePermissions = (query?: RolePermissionListQuery) =>
  api.get<PageResult<RolePermission>>("/api/sys/role-permission/list", query)

export const deleteRolePermission = (body: CreateRolePermission) =>
  api.post<boolean>("/api/sys/role-permission/delete", body)
