import type { CreateTag, PageResult, Tag, UpdateTag } from "@goi/contracts"
import { tagListQuerySchema } from "@goi/contracts"
import { z } from "zod"
import type { RequestFn } from "../core/types"

export const tagListQuery = tagListQuerySchema
export type TagListQuery = z.infer<typeof tagListQuery>

export const createTagApi = (request: RequestFn) => ({
  list: (query?: TagListQuery) => {
    return request<PageResult<Tag>>("/api/tags/list", {
      params: query,
    })
  },
  create: (data: CreateTag) => {
    return request<Tag>("/api/tags/create", {
      method: "POST",
      body: data,
    })
  },
  update: (data: UpdateTag) => {
    return request<Tag>("/api/tags/update", {
      method: "POST",
      body: data,
    })
  },
  delete: (id: string) => {
    return request<boolean>("/api/tags/delete", {
      method: "POST",
      body: { id },
    })
  },
  find: (id: string) => {
    return request<Tag>("/api/tags/find", {
      params: { id },
    })
  },
})

export type TagApi = ReturnType<typeof createTagApi>
