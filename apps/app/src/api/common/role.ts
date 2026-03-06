import type { AppRole, CreateAppRole, PageResult, UpdateAppRole } from "@goi/contracts"
import { appRoleListQuerySchema } from "@goi/contracts"
import { z } from "zod"
import type { RequestFn } from "../core/types"

export const roleListQuerySchema = appRoleListQuerySchema
export type RoleListQuery = z.infer<typeof roleListQuerySchema>

export const createRoleApi = (request: RequestFn) => ({
  list: (query?: RoleListQuery) => {
    return request<PageResult<AppRole>>("/api/sys/role/list", {
      params: query,
    })
  },
  create: (data: CreateAppRole) => {
    return request<AppRole>("/api/sys/role/create", {
      method: "POST",
      body: data,
    })
  },
  update: (data: UpdateAppRole) => {
    return request<AppRole>("/api/sys/role/update", {
      method: "POST",
      body: data,
    })
  },
  delete: (roleId: string) => {
    return request<boolean>("/api/sys/role/delete", {
      method: "POST",
      body: { roleId },
    })
  },
})

export type RoleApi = ReturnType<typeof createRoleApi>
