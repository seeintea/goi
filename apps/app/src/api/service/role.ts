import type { PageQuery, PageResult } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type Role = {
  roleId: string
  roleCode: string
  roleName: string
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRole = {
  roleCode: string
  roleName: string
  isDisabled?: boolean
}

export type UpdateRole = {
  roleId: string
  roleCode?: string
  roleName?: string
  isDisabled?: boolean
  isDeleted?: boolean
}

export type RoleListQuery = PageQuery & {
  roleCode?: string
  roleName?: string
}

export const createRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateRole
  return await serverFetch<Role>("/api/sys/role/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createRole = createRoleFnBase as unknown as (ctx: { data: CreateRole }) => Promise<Role>

export const findRoleFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const roleId = ctx.data as string
  const params = new URLSearchParams({ roleId })
  return await serverFetch<Role>(`/api/sys/role/find?${params}`, {
    method: "GET",
  })
})

export const findRole = findRoleFnBase as unknown as (ctx: { data: string }) => Promise<Role>

export const listRolesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as RoleListQuery
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Role>>(`/api/sys/role/list?${params}`, {
    method: "GET",
  })
})

export const listRoles = listRolesFnBase as unknown as (ctx: { data: RoleListQuery }) => Promise<PageResult<Role>>

export const updateRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateRole
  return await serverFetch<Role>("/api/sys/role/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateRole = updateRoleFnBase as unknown as (ctx: { data: UpdateRole }) => Promise<Role>

export const deleteRoleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const roleId = ctx.data as string
  return await serverFetch<boolean>("/api/sys/role/delete", {
    method: "POST",
    body: { roleId } as unknown as BodyInit,
  })
})

export const deleteRole = deleteRoleFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
