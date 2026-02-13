import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../client"

export type Module = {
  moduleId: string
  parentId: string | null
  name: string
  routePath: string
  permissionCode: string
  sort: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type CreateModule = {
  name: string
  routePath: string
  permissionCode: string
  parentId?: string | null
  sort?: number
}

export type UpdateModule = {
  moduleId: string
  parentId?: string | null
  name?: string
  routePath?: string
  permissionCode?: string
  sort?: number
  isDeleted?: boolean
}

export type ModuleListQuery = PageQuery & {
  parentId?: string
  name?: string
  routePath?: string
  permissionCode?: string
}

export const createModule = (body: CreateModule) => api.post<Module>("/api/sys/module/create", body)

export const findModule = (moduleId: string) => api.get<Module>("/api/sys/module/find", { moduleId })

export const listModules = (query?: ModuleListQuery) => api.get<PageResult<Module>>("/api/sys/module/list", query)

export const listAllModules = (query?: Omit<ModuleListQuery, "page" | "pageSize">) =>
  api.get<Module[]>("/api/sys/module/all", query)

export const listRootModules = () => api.get<Module[]>("/api/sys/module/roots")

export const updateModule = (body: UpdateModule) => api.post<Module>("/api/sys/module/update", body)

export const deleteModule = (moduleId: string) => api.post<boolean>("/api/sys/module/delete", { moduleId })
