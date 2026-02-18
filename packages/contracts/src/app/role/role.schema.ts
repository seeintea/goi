import { z } from "zod"

const shape = {
  roleId: z.string().length(32).describe("角色ID"),
  familyId: z.string().uuid().nullable().describe("家庭ID"),
  roleCode: z.string().min(1).max(30).describe("角色编码"),
  roleName: z.string().min(1).max(50).describe("角色名称"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createdAt: z.iso.datetime().describe("创建时间"),
  updatedAt: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

export const appRoleResponseSchema = z
  .object({
    roleId: shape.roleId,
    familyId: shape.familyId,
    roleCode: shape.roleCode,
    roleName: shape.roleName,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createdAt: shape.createdAt,
    updatedAt: shape.updatedAt,
  })
  .meta({ id: "角色响应类型" })

export const createAppRoleSchema = z
  .object({
    familyId: shape.familyId.optional(),
    roleCode: shape.roleCode,
    roleName: shape.roleName,
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建角色请求" })

export const updateAppRoleSchema = z
  .object({
    roleId: shape.roleId,
    familyId: shape.familyId.optional(),
    roleCode: shape.roleCode.optional(),
    roleName: shape.roleName.optional(),
    isDisabled: shape.isDisabled.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新角色请求" })

export const deleteAppRoleSchema = z
  .object({
    roleId: shape.roleId,
  })
  .meta({ id: "删除角色请求" })

export const appRoleListQuerySchema = z
  .object({
    familyId: shape.familyId.optional(),
    roleCode: shape.roleCode.optional(),
    roleName: shape.roleName.optional(),
    userId: z.string().optional().describe("用户ID"),
    username: z.string().min(1).max(30).optional().describe("用户名称"),
    isDeleted: shape.isDeleted.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询角色分页列表请求" })

const rolePageItemSchema = z.object({
  roleId: shape.roleId,
  familyId: shape.familyId,
  roleCode: shape.roleCode,
  roleName: shape.roleName,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
})

export const appRolePageResponseSchema = z
  .object({
    list: z.array(rolePageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "角色分页响应" })

export const updateRolePermissionsSchema = z
  .object({
    roleId: shape.roleId,
    permissionIds: z.array(z.string()).describe("权限ID列表"),
    moduleIds: z.array(z.string()).optional().describe("模块ID列表"),
  })
  .meta({ id: "更新角色权限关联请求" })

export type AppRole = z.infer<typeof appRoleResponseSchema>
export type CreateAppRole = z.infer<typeof createAppRoleSchema>
export type UpdateAppRole = z.infer<typeof updateAppRoleSchema>
export type UpdateRolePermissions = z.infer<typeof updateRolePermissionsSchema>
