import {
  type CreateTag,
  type TagListQuery,
  type UpdateTag,
  createTag,
  deleteTag,
  findTag,
  listTags,
  updateTag,
} from "../service/tag"
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const tagKeys = {
  all: ["tag"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (query?: TagListQuery) => [...tagKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...tagKeys.all, "find", id] as const,
}

export const tagListOptions = (query?: TagListQuery) =>
  queryOptions({
    queryKey: tagKeys.list(query),
    queryFn: () => listTags(query),
  })

export const tagOptions = (id: string) =>
  queryOptions({
    queryKey: tagKeys.find(id),
    queryFn: () => findTag(id),
    enabled: Boolean(id),
  })

export function useTagList(query?: TagListQuery) {
  return useQuery(tagListOptions(query))
}

export function useTag(id: string) {
  return useQuery(tagOptions(id))
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateTag) => {
      const res = await createTag(body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateTag) => {
      const res = await updateTag(body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.find(data.id) })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteTag(id)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}
