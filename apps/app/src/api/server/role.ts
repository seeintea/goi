import type { AppRole, CreateAppRole, PageResult, UpdateAppRole } from "@goi/contracts"
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

const createRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.create(ctx.data as CreateAppRole)
})
export const createRoleFn = createRoleFnBase as unknown as (ctx: { data: CreateAppRole }) => Promise<AppRole>

const updateRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.update(ctx.data as UpdateAppRole)
})
export const updateRoleFn = updateRoleFnBase as unknown as (ctx: { data: UpdateAppRole }) => Promise<AppRole>

const deleteRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.delete(ctx.data as string)
})
export const deleteRoleFn = deleteRoleFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
