import type { AppModule, CreateAppModule, PageQuery, PageResult, UpdateAppModule } from "@goi/contracts"
import { api } from "../../client"

export type AppModuleListQuery = PageQuery & {
  parentId?: string | null
  name?: string
  routePath?: string
  permissionCode?: string
}

export type AppModuleAllQuery = Omit<AppModuleListQuery, "page" | "pageSize">

export const createAppModule = (body: CreateAppModule) => api.post<AppModule>("/api/app/module/create", body)

export const findAppModule = (moduleId: string) => api.get<AppModule>("/api/app/module/find", { moduleId })

export const listAppModules = (query?: AppModuleListQuery) =>
  api.get<PageResult<AppModule>>("/api/app/module/list", query)

export const listAllAppModules = (query?: AppModuleAllQuery) => api.get<AppModule[]>("/api/app/module/all", query)

export const listRootAppModules = () => api.get<AppModule[]>("/api/app/module/roots")

export const updateAppModule = (body: UpdateAppModule) => api.post<AppModule>("/api/app/module/update", body)

export const deleteAppModule = (moduleId: string) => api.post<boolean>("/api/app/module/delete", { moduleId })
