import type { RemoveFamilyMemberByUserId } from "@goi/contracts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFamilyMemberApi } from "../common/family-member"
import { clientRequest } from "../core/client"
import { userKeys } from "./user"

const api = createFamilyMemberApi(clientRequest)

export function useRemoveFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RemoveFamilyMemberByUserId) => api.removeByUserId(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
