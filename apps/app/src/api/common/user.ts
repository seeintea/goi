import type { AppUser, CreateAppUser, PageResult, UpdateAppUser } from "@goi/contracts"
import { pageQuerySchema } from "@goi/contracts"
import { z } from "zod"
import type { RequestFn } from "../core/types"

export const userListQuerySchema = pageQuerySchema.extend({
  username: z.string().optional(),
})
export type UserListQuery = z.infer<typeof userListQuerySchema>

export const createUserApi = (request: RequestFn) => ({
  create: (data: CreateAppUser) => {
    return request<AppUser>("/api/sys/user/create", {
      method: "POST",
      body: data,
    })
  },

  list: (query?: UserListQuery) => {
    return request<PageResult<AppUser>>("/api/sys/user/list", {
      params: query,
    })
  },

  find: (userId: string) => {
    return request<AppUser>("/api/sys/user/find", {
      params: { userId },
    })
  },

  update: (data: UpdateAppUser) => {
    return request<AppUser>("/api/sys/user/update", {
      method: "POST",
      body: data,
    })
  },

  delete: (userId: string) => {
    return request<boolean>("/api/sys/user/delete", {
      method: "POST",
      body: { userId },
    })
  },
})

export type UserApi = ReturnType<typeof createUserApi>
