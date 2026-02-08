import type { AdminModule, CreateAdminModule, UpdateAdminModule } from "@goi/contracts/admin/module"
import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../../client"

export type AdminModuleListQuery = PageQuery & {
  parentId?: string | null
  name?: string
  routePath?: string
  permissionCode?: string
}

export type AdminModuleAllQuery = Omit<AdminModuleListQuery, "page" | "pageSize">

export const createAdminModule = (body: CreateAdminModule) =>
  api.post<AdminModule>("/api/admin/module/create", body)

export const findAdminModule = (moduleId: string) => api.get<AdminModule>("/api/admin/module/find", { moduleId })

export const listAdminModules = (query?: AdminModuleListQuery) =>
  api.get<PageResult<AdminModule>>("/api/admin/module/list", query)

export const listAllAdminModules = (query?: AdminModuleAllQuery) =>
  api.get<AdminModule[]>("/api/admin/module/all", query)

export const listRootAdminModules = () => api.get<AdminModule[]>("/api/admin/module/roots")

export const updateAdminModule = (body: UpdateAdminModule) => api.post<AdminModule>("/api/admin/module/update", body)

export const deleteAdminModule = (moduleId: string) => api.post<boolean>("/api/admin/module/delete", { moduleId })
