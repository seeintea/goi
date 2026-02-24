import type { AppRole, CreateAppRole, PageQuery, PageResult, UpdateAppRole } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type Role = AppRole
export type CreateRole = CreateAppRole
export type UpdateRole = UpdateAppRole

export type RoleListQuery = PageQuery & {
  roleCode?: string
  roleName?: string
}

const createRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppRole
  return await serverFetch<AppRole>("/api/sys/role/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createRole = createRoleFnBase as unknown as (ctx: { data: CreateAppRole }) => Promise<AppRole>

const findRoleFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const roleId = ctx.data as string
  const params = new URLSearchParams({ roleId })
  return await serverFetch<AppRole>(`/api/sys/role/find?${params}`, {
    method: "GET",
  })
})

export const findRole = findRoleFnBase as unknown as (ctx: { data: string }) => Promise<AppRole>

const listRolesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as RoleListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<AppRole>>(`/api/sys/role/list?${params}`, {
    method: "GET",
  })
})

export const listRoles = listRolesFnBase as unknown as (ctx: {
  data: RoleListQuery | undefined
}) => Promise<PageResult<AppRole>>

const updateRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateAppRole
  return await serverFetch<AppRole>("/api/sys/role/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateRole = updateRoleFnBase as unknown as (ctx: { data: UpdateAppRole }) => Promise<AppRole>

const deleteRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const roleId = ctx.data as string
  return await serverFetch<boolean>("/api/sys/role/delete", {
    method: "POST",
    body: { roleId } as unknown as BodyInit,
  })
})

export const deleteRole = deleteRoleFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
