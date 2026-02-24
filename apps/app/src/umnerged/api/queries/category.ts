import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type CategoryListQuery,
  type CreateCategory,
  createCategory,
  deleteCategory,
  findCategory,
  listCategories,
  type UpdateCategory,
  updateCategory,
} from "../service/category"

export const categoryKeys = {
  all: ["category"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (query?: CategoryListQuery) => [...categoryKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...categoryKeys.all, "find", id] as const,
}

export const categoryListOptions = (query?: CategoryListQuery) =>
  queryOptions({
    queryKey: categoryKeys.list(query),
    queryFn: () => listCategories({ data: query }),
  })

export const categoryOptions = (id: string) =>
  queryOptions({
    queryKey: categoryKeys.find(id),
    queryFn: () => findCategory({ data: id }),
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
      const res = await createCategory({ data: body })
      return res
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
      const res = await updateCategory({ data: body })
      return res
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
      const res = await deleteCategory({ data: id })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}
