import type { 
  CreateFamily, 
  Family, 
  PageResult
} from "@goi/contracts"
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
      body: JSON.stringify(data),
    })
  },

  list: (query?: FamilyListQuery) => {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    return request<PageResult<Family>>(`/api/ff/book/list?${params}`)
  },

  bind: (data: { familyId: string }) => {
    return request<boolean>("/api/ff/book/bind", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
})

export type FamilyApi = ReturnType<typeof createFamilyApi>
