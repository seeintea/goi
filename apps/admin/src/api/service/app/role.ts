import type { PageQuery, PageResult, UpdateRolePermissions } from "@goi/contracts"
import { api } from "../../client"

export type AppRole = {
  roleId: string
  roleCode: string
  roleName: string
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  allowDelete: boolean
  allowDisable: boolean
}

export type CreateAppRole = {
  familyId?: string
  roleCode: string
  roleName: string
}

export type UpdateAppRole = {
  roleId: string
  familyId?: string
  roleCode?: string
  roleName?: string
  isDeleted?: boolean
}

export type UpdateAppRoleStatus = {
  roleId: string
  isDisabled: boolean
}

export type AppRoleListQuery = PageQuery & {
  roleCode?: string
  roleName?: string
  userId?: string
  username?: string
  isDeleted?: boolean
}

export const createAppRole = (body: CreateAppRole) => api.post<AppRole>("/api/app/role/create", body)

export const findAppRole = (roleId: string) => api.get<AppRole>("/api/app/role/find", { roleId })

export const listAppRoles = (query?: AppRoleListQuery) => api.get<PageResult<AppRole>>("/api/app/role/list", query)

export const updateAppRole = (body: UpdateAppRole) => api.post<AppRole>("/api/app/role/update", body)

export const updateAppRoleStatus = (body: UpdateAppRoleStatus) => api.post<AppRole>("/api/app/role/updateStatus", body)

export const deleteAppRole = (roleId: string) => api.post<boolean>("/api/app/role/delete", { roleId })

export const getRolePermissions = (roleId: string) => api.get<string[]>("/api/app/role/permissions", { roleId })

export const updateRolePermissions = (body: UpdateRolePermissions) =>
  api.post<boolean>("/api/app/role/updatePermissions", body)
