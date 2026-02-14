import { api } from "@/api/client-csr"
import type { PageQuery, PageResult } from "@/types/api"

export type Role = {
  roleId: string
  roleCode: string
  roleName: string
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRole = {
  roleCode: string
  roleName: string
  isDisabled?: boolean
}

export type UpdateRole = {
  roleId: string
  roleCode?: string
  roleName?: string
  isDisabled?: boolean
  isDeleted?: boolean
}

export type RoleListQuery = PageQuery & {
  roleCode?: string
  roleName?: string
}

export const createRole = (body: CreateRole) => api.post<Role>("/api/sys/role/create", body)

export const findRole = (roleId: string) => api.get<Role>("/api/sys/role/find", { roleId })

export const listRoles = (query?: RoleListQuery) => api.get<PageResult<Role>>("/api/sys/role/list", query)

export const updateRole = (body: UpdateRole) => api.post<Role>("/api/sys/role/update", body)

export const deleteRole = (roleId: string) => api.post<boolean>("/api/sys/role/delete", { roleId })
