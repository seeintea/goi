import type { CreateTag, PageResult, Tag, tagListQuerySchema, UpdateTag } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type TagListQuery = z.infer<typeof tagListQuerySchema>
export type { CreateTag, Tag, UpdateTag }

const createTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateTag
  return await serverFetch<Tag>("/api/tags/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createTag = createTagFnBase as unknown as (ctx: { data: CreateTag }) => Promise<Tag>

const findTagFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Tag>(`/api/tags/find?${params}`, {
    method: "GET",
  })
})

export const findTag = findTagFnBase as unknown as (ctx: { data: string }) => Promise<Tag>

const listTagsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as TagListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Tag>>(`/api/tags/list?${params}`, {
    method: "GET",
  })
})

export const listTags = listTagsFnBase as unknown as (ctx: {
  data: TagListQuery | undefined
}) => Promise<PageResult<Tag>>

const updateTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateTag
  return await serverFetch<Tag>("/api/tags/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateTag = updateTagFnBase as unknown as (ctx: { data: UpdateTag }) => Promise<Tag>

const deleteTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/tags/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteTag = deleteTagFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
