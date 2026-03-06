import type { CreateFamily, GenerateInviteCode } from "@goi/contracts"
import { useMutation } from "@tanstack/react-query"
import { createFamilyApi } from "../common/family"
import { clientRequest } from "../core/client"

const api = createFamilyApi(clientRequest)

export function useCreateFamily() {
  return useMutation({
    mutationFn: (data: CreateFamily) => api.create(data),
  })
}

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: (data: GenerateInviteCode) => api.generateInviteCode(data),
  })
}

export function useBindFamily() {
  return useMutation({
    mutationFn: (data: { familyId: string }) => api.join(data),
  })
}
