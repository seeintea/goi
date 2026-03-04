import type { GenerateInviteCode } from "@goi/contracts"
import { useMutation } from "@tanstack/react-query"
import { createFamilyApi } from "../common/family"
import { clientRequest } from "../core/client"

const api = createFamilyApi(clientRequest)

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: (data: GenerateInviteCode) => api.generateInviteCode(data),
  })
}
