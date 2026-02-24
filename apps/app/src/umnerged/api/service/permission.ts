import type { AppPermission, CreateAppPermission, PageQuery, PageResult, UpdateAppPermission } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export const createPermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppPermission
  return await serverFetch<AppPermission>("/api/sys/permission/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createPermission = createPermissionFnBase as unknown as (ctx: {
  data: CreateAppPermission
}) => Promise<AppPermission>

export const findPermissionFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const permissionId = ctx.data as string
  const params = new URLSearchParams({ permissionId })
  return await serverFetch<AppPermission>(`/api/sys/permission/find?${params}`, {
    method: "GET",
  })
})

export const findPermission = findPermissionFnBase as unknown as (ctx: { data: string }) => Promise<AppPermission>

export const listPermissionsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as PageQuery & {
    code?: string
    moduleId?: string
  }
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<AppPermission>>(`/api/sys/permission/list?${params}`, {
    method: "GET",
  })
})

export const listPermissions = listPermissionsFnBase as unknown as (ctx: {
  data: PageQuery & {
    code?: string
    moduleId?: string
  }
}) => Promise<PageResult<AppPermission>>

export const updatePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateAppPermission
  return await serverFetch<AppPermission>("/api/sys/permission/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updatePermission = updatePermissionFnBase as unknown as (ctx: {
  data: UpdateAppPermission
}) => Promise<AppPermission>

export const deletePermissionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const permissionId = ctx.data as string
  return await serverFetch<boolean>("/api/sys/permission/delete", {
    method: "POST",
    body: { permissionId } as unknown as BodyInit,
  })
})

export const deletePermission = deletePermissionFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
