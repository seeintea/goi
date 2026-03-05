import type { AppRole, PageResult } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { createRoleApi, type RoleListQuery } from "../common/role"
import { serverRequest } from "../core/server"

const api = createRoleApi(serverRequest)

const listRolesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  return api.list(ctx.data as RoleListQuery | undefined)
})
export const listRolesFn = listRolesFnBase as unknown as (ctx: {
  data: RoleListQuery | undefined
}) => Promise<PageResult<AppRole>>
