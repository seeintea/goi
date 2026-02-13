import {
  type CategoryListQuery,
  type CreateCategory,
  type UpdateCategory,
  createCategory,
  deleteCategory,
  findCategory,
  listCategories,
  updateCategory,
} from "../service/category"
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const categoryKeys = {
  all: ["category"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (query?: CategoryListQuery) => [...categoryKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...categoryKeys.all, "find", id] as const,
}

export const categoryListOptions = (query?: CategoryListQuery) =>
  queryOptions({
    queryKey: categoryKeys.list(query),
    queryFn: () => listCategories(query),
  })

export const categoryOptions = (id: string) =>
  queryOptions({
    queryKey: categoryKeys.find(id),
    queryFn: () => findCategory(id),
    enabled: Boolean(id),
  })

export function useCategoryList(query?: CategoryListQuery) {
  return useQuery(categoryListOptions(query))
}

export function useCategory(id: string) {
  return useQuery(categoryOptions(id))
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCategory) => {
      const res = await createCategory(body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateCategory) => {
      const res = await updateCategory(body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.find(data.id) })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategory(id)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}
