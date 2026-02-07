import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  roleId: z.string().length(32).describe("角色ID"),
  roleCode: z.string().min(1).max(30).describe("角色编码"),
  roleName: z.string().min(1).max(50).describe("角色名称"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createTime: z.iso.datetime().describe("创建时间"),
  updateTime: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const roleResponseSchema = z
  .object({
    roleId: shape.roleId,
    roleCode: shape.roleCode,
    roleName: shape.roleName,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createTime: shape.createTime,
    updateTime: shape.updateTime,
  })
  .meta({ id: "角色响应类型" })

const createRoleSchema = z
  .object({
    roleCode: shape.roleCode,
    roleName: shape.roleName,
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建角色请求" })

const updateRoleSchema = z
  .object({
    roleId: shape.roleId,
    roleCode: shape.roleCode.optional(),
    roleName: shape.roleName.optional(),
    isDisabled: shape.isDisabled.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新角色请求" })

const deleteRoleSchema = z
  .object({
    roleId: shape.roleId,
  })
  .meta({ id: "删除角色请求" })

const roleListQuerySchema = z
  .object({
    roleCode: shape.roleCode.optional(),
    roleName: shape.roleName.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询角色分页列表请求" })

const rolePageItemSchema = z.object({
  roleId: shape.roleId,
  roleCode: shape.roleCode,
  roleName: shape.roleName,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

const rolePageResponseSchema = z
  .object({
    list: z.array(rolePageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "角色分页响应" })

export class RoleResponseDto extends createZodDto(roleResponseSchema) {}
export class CreateRoleDto extends createZodDto(createRoleSchema) {}
export class UpdateRoleDto extends createZodDto(updateRoleSchema) {}
export class DeleteRoleDto extends createZodDto(deleteRoleSchema) {}
export class RoleListQueryDto extends createZodDto(roleListQuerySchema) {}
export class RolePageResponseDto extends createZodDto(rolePageResponseSchema) {}

export type Role = z.infer<typeof roleResponseSchema>
export type CreateRole = z.infer<typeof createRoleSchema>
export type UpdateRole = z.infer<typeof updateRoleSchema>
