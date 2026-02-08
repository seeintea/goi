import { AdminUser, CreateAdminUser, UpdateAdminUser } from "@goi/contracts";
import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../../client"

export type AdminUserListQuery = PageQuery & {
  userId?: string
  username?: string
}

export const createAdminUser = (body: CreateAdminUser) => api.post<AdminUser>("/api/admin/user/create", body)

export const findAdminUser = (userId: string) => api.get<AdminUser>("/api/admin/user/find", { userId })

export const listAdminUsers = (query?: AdminUserListQuery) =>
  api.get<PageResult<AdminUser>>("/api/admin/user/list", query)

export const updateAdminUser = (body: UpdateAdminUser) => api.post<AdminUser>("/api/admin/user/update", body)

export const deleteAdminUser = (userId: string) => api.post<boolean>("/api/admin/user/delete", { userId })
