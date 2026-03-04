import type { RemoveFamilyMemberByUserId } from "@goi/contracts"
import type { RequestFn } from "../core/types"

export const createFamilyMemberApi = (request: RequestFn) => ({
  removeByUserId: (data: RemoveFamilyMemberByUserId) => {
    return request<boolean>("/api/family-members/remove-by-user", {
      method: "POST",
      body: data,
    })
  },
})

export type FamilyMemberApi = ReturnType<typeof createFamilyMemberApi>
