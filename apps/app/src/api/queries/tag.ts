import type { CreateTag, PageResult, UpdateTag } from "@goi/contracts"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { TagListQuery } from "../common/tag"
import { createTagFn, deleteTagFn, listTagsFn, updateTagFn } from "../server/tag"

export const tagKeys = {
  all: ["tag"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (query?: TagListQuery) => [...tagKeys.all, "list", query ?? null] as const,
}

export function useTagList(query?: TagListQuery) {
  return useQuery({
    queryKey: tagKeys.list(query),
    queryFn: () => listTagsFn({ data: query }),
    placeholderData: keepPreviousData,
    enabled: !!query?.familyId,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTag) => createTagFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTag) => updateTagFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTagFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}
