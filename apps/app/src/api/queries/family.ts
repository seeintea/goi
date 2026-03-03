import type { GenerateInviteCode } from "@goi/contracts"
import { useMutation } from "@tanstack/react-query"
import { generateInviteCodeFn } from "../server/family"

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: (data: GenerateInviteCode) => generateInviteCodeFn({ data }),
  })
}
