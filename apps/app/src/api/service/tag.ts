import type { CreateTag, Tag, tagListQuerySchema, UpdateTag } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client-csr"
import type { PageResult } from "@/types/api"

export type TagListQuery = z.infer<typeof tagListQuerySchema>
export type { CreateTag, Tag, UpdateTag }

export const createTag = (body: CreateTag) => api.post<Tag>("/api/tags/create", body)

export const findTag = (id: string) => api.get<Tag>("/api/tags/find", { id })

export const listTags = (query?: TagListQuery) => api.get<PageResult<Tag>>("/api/tags/list", query)

export const updateTag = (body: UpdateTag) => api.post<Tag>("/api/tags/update", body)

export const deleteTag = (id: string) => api.post<boolean>("/api/tags/delete", { id })
