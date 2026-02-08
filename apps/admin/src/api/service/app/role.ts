import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../../client"

export type AppRole = {
  roleId: string
  roleCode: string
  roleName: string
  isDisabled: boolean
  isDeleted: boolean
  createTime: string
  updateTime: string
}

export type CreateAppRole = {
  roleCode: string
  roleName: string
  isDisabled?: boolean
}

export type UpdateAppRole = {
  roleId: string
  roleCode?: string
  roleName?: string
  isDisabled?: boolean
  isDeleted?: boolean
}

export type AppRoleListQuery = PageQuery & {
  roleCode?: string
  roleName?: string
}

export const createAppRole = (body: CreateAppRole) => api.post<AppRole>("/api/app/role/create", body)

export const findAppRole = (roleId: string) => api.get<AppRole>("/api/app/role/find", { roleId })

export const listAppRoles = (query?: AppRoleListQuery) => api.get<PageResult<AppRole>>("/api/app/role/list", query)

export const updateAppRole = (body: UpdateAppRole) => api.post<AppRole>("/api/app/role/update", body)

export const deleteAppRole = (roleId: string) => api.post<boolean>("/api/app/role/delete", { roleId })
