import type { AppRole, PageResult } from "@goi/contracts"
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
})

export type RoleApi = ReturnType<typeof createRoleApi>
