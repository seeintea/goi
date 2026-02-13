import { type Category, type CreateCategory, categoryListQuerySchema, type UpdateCategory } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client"
import type { PageResult } from "@/types/api"

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>
export type { Category, CreateCategory, UpdateCategory }

export const createCategory = (body: CreateCategory) => api.post<Category>("/api/categories/create", body)

export const findCategory = (id: string) => api.get<Category>("/api/categories/find", { id })

export const listCategories = (query?: CategoryListQuery) =>
  api.get<PageResult<Category>>("/api/categories/list", query)

export const updateCategory = (body: UpdateCategory) => api.post<Category>("/api/categories/update", body)

export const deleteCategory = (id: string) => api.post<boolean>("/api/categories/delete", { id })
