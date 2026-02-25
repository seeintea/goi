import type { CreateFamily, Family, PageResult } from "@goi/contracts"
import { pageQuerySchema } from "@goi/contracts"
import { z } from "zod"
import type { RequestFn } from "../core/types"

export const familyListQuerySchema = pageQuerySchema.extend({
  name: z.string().optional(),
})
export type FamilyListQuery = z.infer<typeof familyListQuerySchema>

// Note: Assuming 'Family' related endpoints are under /api/ff/book based on previous file content
// Using 'book' as the resource name in API paths but exposing as 'Family' in domain logic.

export const createFamilyApi = (request: RequestFn) => ({
  create: (data: CreateFamily) => {
    return request<Family>("/api/ff/book/create", {
      method: "POST",
      body: data,
    })
  },

  list: (query?: FamilyListQuery) => {
    return request<PageResult<Family>>("/api/ff/book/list", {
      params: query,
    })
  },

  bind: (data: { familyId: string }) => {
    return request<boolean>("/api/ff/book/bind", {
      method: "POST",
      body: data,
    })
  },
})

export type FamilyApi = ReturnType<typeof createFamilyApi>
