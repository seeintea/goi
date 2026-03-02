import { z } from "zod"

const shape = {
  roleId: z.string().uuid().describe("角色ID"),
  moduleId: z.string().uuid().describe("模块ID"),
  createdAt: z.string().datetime().describe("创建时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
}

export const createAppRoleModuleSchema = z.object({
  roleId: shape.roleId,
  moduleId: shape.moduleId,
})

export const appRoleModuleResponseSchema = z.object({
  roleId: shape.roleId,
  moduleId: shape.moduleId,
  createdAt: shape.createdAt,
})

export const deleteAppRoleModuleSchema = z.object({
  roleId: shape.roleId,
  moduleId: shape.moduleId,
})

export const appRoleModuleListQuerySchema = z.object({
  roleId: shape.roleId.optional(),
  moduleId: shape.moduleId.optional(),
  page: shape.page.optional(),
  pageSize: shape.pageSize.optional(),
})

export const appRoleModulePageResponseSchema = z.object({
  list: z.array(appRoleModuleResponseSchema),
  total: z.number().int().min(0),
  page: shape.page,
  pageSize: shape.pageSize,
})

export type AppRoleModule = z.infer<typeof appRoleModuleResponseSchema>
export type CreateAppRoleModule = z.infer<typeof createAppRoleModuleSchema>
export type DeleteAppRoleModule = z.infer<typeof deleteAppRoleModuleSchema>
export type AppRoleModuleListQuery = z.infer<typeof appRoleModuleListQuerySchema>
export type AppRoleModulePageResponse = z.infer<typeof appRoleModulePageResponseSchema>
