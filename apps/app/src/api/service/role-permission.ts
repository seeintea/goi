import type { PageQuery, PageResult } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type RolePermission = {
  roleId: string
  permissionId: string
  createdAt: string
}

export type CreateRolePermission = {
  roleId: string
  permissionId: string
}

export type RolePermissionListQuery = PageQuery & {
  roleId?: string
  permissionId?: string
}

export const createRolePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateRolePermission
  return await serverFetch<RolePermission>("/api/sys/role-permission/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createRolePermission = createRolePermissionFnBase as unknown as (ctx: {
  data: CreateRolePermission
}) => Promise<RolePermission>

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

export const listRolePermissionsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as RolePermissionListQuery
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<RolePermission>>(`/api/sys/role-permission/list?${params}`, {
    method: "GET",
  })
})

export const listRolePermissions = listRolePermissionsFnBase as unknown as (ctx: {
  data: RolePermissionListQuery
}) => Promise<PageResult<RolePermission>>

export const deleteRolePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateRolePermission
  return await serverFetch<boolean>("/api/sys/role-permission/delete", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const deleteRolePermission = deleteRolePermissionFnBase as unknown as (ctx: {
  data: CreateRolePermission
}) => Promise<boolean>
