import type { CreateTag, PageResult, Tag, UpdateTag } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { createTagApi, type TagListQuery } from "../common/tag"
import { serverRequest } from "../core/server"

const api = createTagApi(serverRequest)

const listTagsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  return api.list(ctx.data as TagListQuery | undefined)
})
export const listTagsFn = listTagsFnBase as unknown as (ctx: {
  data: TagListQuery | undefined
}) => Promise<PageResult<Tag>>

const createTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.create(ctx.data as CreateTag)
})
export const createTagFn = createTagFnBase as unknown as (ctx: { data: CreateTag }) => Promise<Tag>

const updateTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.update(ctx.data as UpdateTag)
})
export const updateTagFn = updateTagFnBase as unknown as (ctx: { data: UpdateTag }) => Promise<Tag>

const deleteTagFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.delete(ctx.data as string)
})
export const deleteTagFn = deleteTagFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
