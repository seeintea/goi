import type { AppPermission, CreateAppPermission, PageQuery, PageResult, UpdateAppPermission } from "@goi/contracts"
import { api } from "../../client"

export type AppPermissionListQuery = PageQuery & {
  code?: string
  moduleId?: string
}

export const createAppPermission = (body: CreateAppPermission) =>
  api.post<AppPermission>("/api/app/permission/create", body)

export const findAppPermission = (permissionId: string) =>
  api.get<AppPermission>("/api/app/permission/find", { permissionId })

export const listAppPermissions = (query?: AppPermissionListQuery) =>
  api.get<PageResult<AppPermission>>("/api/app/permission/list", query)

export const updateAppPermission = (body: UpdateAppPermission) =>
  api.post<AppPermission>("/api/app/permission/update", body)

export const deleteAppPermission = (permissionId: string) =>
  api.post<boolean>("/api/app/permission/delete", { permissionId })
