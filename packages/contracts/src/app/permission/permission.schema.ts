import { z } from "zod"

const shape = {
  permissionId: z.string().length(32).describe("权限ID"),
  code: z.string().min(1).max(80).describe("权限编码"),
  name: z.string().max(80).describe("权限名称"),
  moduleId: z.uuid().describe("模块ID"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createdAt: z.iso.datetime().describe("创建时间"),
  updatedAt: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
  moduleName: z.string().nullish().describe("模块名称"),
} satisfies z.ZodRawShape

export const appPermissionResponseSchema = z
  .object({
    permissionId: shape.permissionId,
    code: shape.code,
    name: shape.name,
    moduleId: shape.moduleId,
    moduleName: shape.moduleName,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createdAt: shape.createdAt,
    updatedAt: shape.updatedAt,
  })
  .meta({ id: "权限响应类型" })

export const createAppPermissionSchema = z
  .object({
    code: shape.code,
    name: shape.name.optional(),
    moduleId: shape.moduleId,
  })
  .meta({ id: "创建权限请求" })

export const updateAppPermissionSchema = z
  .object({
    permissionId: shape.permissionId,
    code: shape.code.optional(),
    name: shape.name.optional(),
    moduleId: shape.moduleId.optional(),
  })
  .meta({ id: "更新权限请求" })

export const updateAppPermissionStatusSchema = z
  .object({
    permissionId: shape.permissionId,
    isDisabled: shape.isDisabled,
  })
  .meta({ id: "更新权限状态请求" })

export const deleteAppPermissionSchema = z
  .object({
    permissionId: shape.permissionId,
  })
  .meta({ id: "删除权限请求" })

export const appPermissionListQuerySchema = z
  .object({
    code: shape.code.optional(),
    moduleId: shape.moduleId.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询权限分页列表请求" })

const appPermissionPageItemSchema = z.object({
  permissionId: shape.permissionId,
  code: shape.code,
  name: shape.name,
  moduleId: shape.moduleId,
  moduleName: shape.moduleName,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
})

export const appPermissionPageResponseSchema = z
  .object({
    list: z.array(appPermissionPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "权限分页响应" })

export interface AppPermissionTreeNode {
  key: string
  title: string
  children?: AppPermissionTreeNode[]
  isLeaf?: boolean
  type: "module" | "permission"
}

export const treeNodeSchema: z.ZodType<AppPermissionTreeNode> = z.lazy(() =>
  z.object({
    key: z.string(),
    title: z.string(),
    children: z.array(treeNodeSchema).optional(),
    isLeaf: z.boolean().optional(),
    type: z.enum(["module", "permission"]),
  }),
)

export const appPermissionTreeResponseSchema = z.array(treeNodeSchema).meta({ id: "权限树响应" })

export type AppPermission = z.infer<typeof appPermissionResponseSchema>
export type CreateAppPermission = z.infer<typeof createAppPermissionSchema>
export type UpdateAppPermission = z.infer<typeof updateAppPermissionSchema>
export type UpdateAppPermissionStatus = z.infer<typeof updateAppPermissionStatusSchema>
export type AppPermissionTreeResponse = z.infer<typeof appPermissionTreeResponseSchema>
