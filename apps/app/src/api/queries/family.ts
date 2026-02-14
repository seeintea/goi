import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type CreateFamily,
  createFamily,
  deleteFamily,
  type FamilyListQuery,
  findFamily,
  listFamilies,
  type UpdateFamily,
  updateFamily,
} from "../service/family"

export const familyKeys = {
  all: ["family"] as const,
  lists: () => [...familyKeys.all, "list"] as const,
  list: (query?: FamilyListQuery) => [...familyKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...familyKeys.all, "find", id] as const,
}

export const familyListOptions = (query?: FamilyListQuery) =>
  queryOptions({
    queryKey: familyKeys.list(query),
    queryFn: () => listFamilies({ data: query }),
  })

export const familyOptions = (id: string) =>
  queryOptions({
    queryKey: familyKeys.find(id),
    queryFn: () => findFamily({ data: id }),
    enabled: Boolean(id),
  })

export function useFamilyList(query?: FamilyListQuery) {
  return useQuery(familyListOptions(query))
}

export function useFamily(id: string) {
  return useQuery(familyOptions(id))
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateFamily) => {
      const res = await createFamily({ data: body })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.lists() })
    },
  })
}

export function useUpdateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateFamily) => {
      const res = await updateFamily({ data: body })
      return res
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: familyKeys.find(data.id) })
    },
  })
}

export function useDeleteFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFamily({ data: id })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.lists() })
    },
  })
}
