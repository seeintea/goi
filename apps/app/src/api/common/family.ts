import type {
  CreateFamily,
  Family,
  GenerateInviteCode,
  InviteCodeResponse,
  PageResult,
  UpdateFamily,
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
    return request<Family>("/api/families/create", {
      method: "POST",
      body: data,
    })
  },

  list: (query?: FamilyListQuery) => {
    return request<PageResult<Family>>("/api/families/list", {
      params: query,
    })
  },

  find: (id: string) => {
    return request<Family>("/api/families/find", {
      params: { id },
    })
  },

  update: (data: UpdateFamily) => {
    return request<Family>("/api/families/update", {
      method: "POST",
      body: data,
    })
  },

  delete: (id: string) => {
    return request<boolean>("/api/families/delete", {
      method: "POST",
      body: { id },
    })
  },

  generateInviteCode: (data: GenerateInviteCode) => {
    return request<InviteCodeResponse>("/api/families/invite-code", {
      method: "POST",
      body: data,
    })
  },

  join: (data: { familyId: string }) => {
    return request<boolean>("/api/families/join", {
      method: "POST",
      body: data,
    })
  },
})

export type FamilyApi = ReturnType<typeof createFamilyApi>
