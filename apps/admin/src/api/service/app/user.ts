import type { AppUser, CreateAppUser, UpdateAppUser } from "@goi/contracts"
import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../../client"

export type AppUserListQuery = PageQuery & {
  userId?: string
  username?: string
}

export const createAppUser = (body: CreateAppUser) => api.post<AppUser>("/api/app/user/create", body)

export const findAppUser = (userId: string) => api.get<AppUser>("/api/app/user/find", { userId })

export const listAppUsers = (query?: AppUserListQuery) => api.get<PageResult<AppUser>>("/api/app/user/list", query)

export const updateAppUser = (body: UpdateAppUser) => api.post<AppUser>("/api/app/user/update", body)

export const deleteAppUser = (userId: string) => api.post<boolean>("/api/app/user/delete", { userId })
