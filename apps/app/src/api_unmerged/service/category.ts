import type { Category, CreateCategory, categoryListQuerySchema, PageResult, UpdateCategory } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>
export type { Category, CreateCategory, UpdateCategory }

const createCategoryFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateCategory
  return await serverFetch<Category>("/api/categories/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createCategory = createCategoryFnBase as unknown as (ctx: { data: CreateCategory }) => Promise<Category>

const findCategoryFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Category>(`/api/categories/find?${params}`, {
    method: "GET",
  })
})

export const findCategory = findCategoryFnBase as unknown as (ctx: { data: string }) => Promise<Category>

const listCategoriesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as CategoryListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Category>>(`/api/categories/list?${params}`, {
    method: "GET",
  })
})

export const listCategories = listCategoriesFnBase as unknown as (ctx: {
  data: CategoryListQuery | undefined
}) => Promise<PageResult<Category>>

const updateCategoryFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateCategory
  return await serverFetch<Category>("/api/categories/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateCategory = updateCategoryFnBase as unknown as (ctx: { data: UpdateCategory }) => Promise<Category>

const deleteCategoryFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/categories/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteCategory = deleteCategoryFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
