import type { AppModule, CreateAppModule, PageQuery, PageResult, UpdateAppModule } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export const createModuleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppModule
  return await serverFetch<AppModule>("/api/sys/module/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createModule = createModuleFnBase as unknown as (ctx: { data: CreateAppModule }) => Promise<AppModule>

export const findModuleFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const moduleId = ctx.data as string
  const params = new URLSearchParams({ moduleId })
  return await serverFetch<AppModule>(`/api/sys/module/find?${params}`, {
    method: "GET",
  })
})

export const findModule = findModuleFnBase as unknown as (ctx: { data: string }) => Promise<AppModule>

export const listModulesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as PageQuery & {
    parentId?: string
    name?: string
    routePath?: string
    permissionCode?: string
  }
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<AppModule>>(`/api/sys/module/list?${params}`, {
    method: "GET",
  })
})

export const listModules = listModulesFnBase as unknown as (ctx: {
  data: PageQuery & {
    parentId?: string
    name?: string
    routePath?: string
    permissionCode?: string
  }
}) => Promise<PageResult<AppModule>>

export const listAllModulesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as {
    parentId?: string
    name?: string
    routePath?: string
    permissionCode?: string
  }
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<AppModule[]>(`/api/sys/module/all?${params}`, {
    method: "GET",
  })
})

export const listAllModules = listAllModulesFnBase as unknown as (ctx: {
  data: {
    parentId?: string
    name?: string
    routePath?: string
    permissionCode?: string
  }
}) => Promise<AppModule[]>

export const listRootModulesFnBase = createServerFn({ method: "GET" }).handler(async () => {
  return await serverFetch<AppModule[]>("/api/sys/module/roots", {
    method: "GET",
  })
})

export const listRootModules = listRootModulesFnBase as unknown as () => Promise<AppModule[]>

export const updateModuleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateAppModule
  return await serverFetch<AppModule>("/api/sys/module/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateModule = updateModuleFnBase as unknown as (ctx: { data: UpdateAppModule }) => Promise<AppModule>

export const deleteModuleFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const moduleId = ctx.data as string
  return await serverFetch<boolean>("/api/sys/module/delete", {
    method: "POST",
    body: { moduleId } as unknown as BodyInit,
  })
})

export const deleteModule = deleteModuleFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
