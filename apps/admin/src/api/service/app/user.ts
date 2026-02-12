import type {
  AppUser,
  CreateAppUser,
  PageQuery,
  PageResult,
  ResetAppUserPassword,
  UpdateAppUser,
  UpdateAppUserStatus,
} from "@goi/contracts"
import { api } from "../../client"

export type AppUserListQuery = PageQuery & {
  userId?: string
  username?: string
  isDisabled?: boolean
  isDeleted?: boolean
}

export const createAppUser = (body: CreateAppUser) => api.post<AppUser>("/api/app/user/create", body)

export const findAppUser = (userId: string) => api.get<AppUser>("/api/app/user/find", { userId })

export const listAppUsers = (query?: AppUserListQuery) => api.get<PageResult<AppUser>>("/api/app/user/list", query)

export const updateAppUser = (body: UpdateAppUser) => api.post<AppUser>("/api/app/user/update", body)

export const resetAppUserPassword = (body: ResetAppUserPassword) =>
  api.post<AppUser>("/api/app/user/reset-password", body)

export const updateAppUserStatus = (body: UpdateAppUserStatus) => api.post<AppUser>("/api/app/user/update-status", body)

export const deleteAppUser = (userId: string) => api.post<boolean>("/api/app/user/delete", { userId })
