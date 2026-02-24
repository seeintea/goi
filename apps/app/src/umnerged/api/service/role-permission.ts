import type { AppRolePermission, CreateAppRolePermission, PageQuery, PageResult } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type RolePermission = AppRolePermission
export type CreateRolePermission = CreateAppRolePermission

export type RolePermissionListQuery = PageQuery & {
  roleId?: string
  permissionId?: string
}

const createRolePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppRolePermission
  return await serverFetch<AppRolePermission>("/api/sys/role-permission/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createRolePermission = createRolePermissionFnBase as unknown as (ctx: {
  data: CreateAppRolePermission
}) => Promise<AppRolePermission>

export const findRolePermissionFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as { roleId: string; permissionId: string }
  const params = new URLSearchParams(query)
  return await serverFetch<RolePermission>(`/api/sys/role-permission/find?${params}`, {
    method: "GET",
  })
})

export const findRolePermission = findRolePermissionFnBase as unknown as (ctx: {
  data: { roleId: string; permissionId: string }
}) => Promise<RolePermission>

const listRolePermissionsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as RolePermissionListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<AppRolePermission>>(`/api/sys/role-permission/list?${params}`, {
    method: "GET",
  })
})

export const listRolePermissions = listRolePermissionsFnBase as unknown as (ctx: {
  data: RolePermissionListQuery | undefined
}) => Promise<PageResult<AppRolePermission>>

const deleteRolePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppRolePermission
  return await serverFetch<boolean>("/api/sys/role-permission/delete", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const deleteRolePermission = deleteRolePermissionFnBase as unknown as (ctx: {
  data: CreateAppRolePermission
}) => Promise<boolean>
