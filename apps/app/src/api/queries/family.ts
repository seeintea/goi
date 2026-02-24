import type { CreateFamily } from "@goi/contracts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFamilyApi } from "../common/family"
import { clientRequest } from "../core/client"

const api = createFamilyApi(clientRequest)

export const familyKeys = {
  all: ["family"] as const,
  lists: () => [...familyKeys.all, "list"] as const,
}

export function useCreateFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFamily) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.lists() })
    },
  })
}

export function useBindFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { familyId: string }) => api.bind(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.lists() })
    },
  })
}
