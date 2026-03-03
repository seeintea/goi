import { GenerateInviteCode, InviteCodeResponse } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { createFamilyApi } from "../common/family"
import { serverRequest } from "../core/server"

const api = createFamilyApi(serverRequest)

const generateInviteCodeFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.generateInviteCode(ctx.data as GenerateInviteCode)
})

export const generateInviteCodeFn = generateInviteCodeFnBase as unknown as (ctx: {
  data: GenerateInviteCode
}) => Promise<InviteCodeResponse>
