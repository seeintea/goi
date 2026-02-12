import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  roleId: z.string().length(32).describe("角色ID"),
  permissionId: z.string().length(32).describe("权限ID"),
  createdAt: z.iso.datetime().describe("创建时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const rolePermissionResponseSchema = z
  .object({
    roleId: shape.roleId,
    permissionId: shape.permissionId,
    createdAt: shape.createdAt,
  })
  .meta({ id: "角色权限关联响应类型" })

const createRolePermissionSchema = z
  .object({
    roleId: shape.roleId,
    permissionId: shape.permissionId,
  })
  .meta({ id: "创建角色权限关联请求" })

const deleteRolePermissionSchema = z
  .object({
    roleId: shape.roleId,
    permissionId: shape.permissionId,
  })
  .meta({ id: "删除角色权限关联请求" })

const rolePermissionListQuerySchema = z
  .object({
    roleId: shape.roleId.optional(),
    permissionId: shape.permissionId.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询角色权限关联分页列表请求" })

const rolePermissionPageItemSchema = z.object({
  roleId: shape.roleId,
  permissionId: shape.permissionId,
  createdAt: shape.createdAt,
})

const rolePermissionPageResponseSchema = z
  .object({
    list: z.array(rolePermissionPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "角色权限关联分页响应" })

export class RolePermissionResponseDto extends createZodDto(rolePermissionResponseSchema) {}
export class CreateRolePermissionDto extends createZodDto(createRolePermissionSchema) {}
export class DeleteRolePermissionDto extends createZodDto(deleteRolePermissionSchema) {}
export class RolePermissionListQueryDto extends createZodDto(rolePermissionListQuerySchema) {}
export class RolePermissionPageResponseDto extends createZodDto(rolePermissionPageResponseSchema) {}

export type RolePermission = z.infer<typeof rolePermissionResponseSchema>
export type CreateRolePermission = z.infer<typeof createRolePermissionSchema>
