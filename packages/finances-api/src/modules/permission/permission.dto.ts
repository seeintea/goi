import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  permissionId: z.string().length(32).describe("权限ID"),
  code: z.string().min(1).max(80).describe("权限编码"),
  name: z.string().max(80).describe("权限名称"),
  moduleId: z.string().length(32).describe("模块ID"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createTime: z.iso.datetime().describe("创建时间"),
  updateTime: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const permissionResponseSchema = z
  .object({
    permissionId: shape.permissionId,
    code: shape.code,
    name: shape.name,
    moduleId: shape.moduleId,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createTime: shape.createTime,
    updateTime: shape.updateTime,
  })
  .meta({ id: "权限响应类型" })

const createPermissionSchema = z
  .object({
    code: shape.code,
    name: shape.name.optional(),
    moduleId: shape.moduleId,
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建权限请求" })

const updatePermissionSchema = z
  .object({
    permissionId: shape.permissionId,
    code: shape.code.optional(),
    name: shape.name.optional(),
    moduleId: shape.moduleId.optional(),
    isDisabled: shape.isDisabled.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新权限请求" })

const deletePermissionSchema = z
  .object({
    permissionId: shape.permissionId,
  })
  .meta({ id: "删除权限请求" })

const permissionListQuerySchema = z
  .object({
    code: shape.code.optional(),
    moduleId: shape.moduleId.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询权限分页列表请求" })

const permissionPageItemSchema = z.object({
  permissionId: shape.permissionId,
  code: shape.code,
  name: shape.name,
  moduleId: shape.moduleId,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

const permissionPageResponseSchema = z
  .object({
    list: z.array(permissionPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "权限分页响应" })

export class PermissionResponseDto extends createZodDto(permissionResponseSchema) {}
export class CreatePermissionDto extends createZodDto(createPermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(updatePermissionSchema) {}
export class DeletePermissionDto extends createZodDto(deletePermissionSchema) {}
export class PermissionListQueryDto extends createZodDto(permissionListQuerySchema) {}
export class PermissionPageResponseDto extends createZodDto(permissionPageResponseSchema) {}

export type Permission = z.infer<typeof permissionResponseSchema>
export type CreatePermission = z.infer<typeof createPermissionSchema>
export type UpdatePermission = z.infer<typeof updatePermissionSchema>
