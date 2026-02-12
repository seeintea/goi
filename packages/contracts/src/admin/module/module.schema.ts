import { z } from "zod"

const shape = {
  moduleId: z.uuid().describe("模块ID"),
  parentId: z.uuid().nullable().describe("父模块ID"),
  name: z.string().min(1).max(80).describe("模块名称"),
  routePath: z.string().min(1).max(200).describe("前端路由路径"),
  permissionCode: z.string().min(1).max(80).describe("页面权限编码"),
  sort: z.coerce.number().int().min(0).describe("排序值"),
  isDeleted: z.boolean().describe("是否删除"),
  createdAt: z.iso.datetime().describe("创建时间"),
  updatedAt: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
  parentModuleName: z.string().nullish().describe("父模块名称"),
} satisfies z.ZodRawShape

export const adminModuleResponseSchema = z
  .object({
    moduleId: shape.moduleId,
    parentId: shape.parentId,
    parentModuleName: shape.parentModuleName,
    name: shape.name,
    routePath: shape.routePath,
    permissionCode: shape.permissionCode,
    sort: shape.sort,
    isDeleted: shape.isDeleted,
    createdAt: shape.createdAt,
    updatedAt: shape.updatedAt,
  })
  .meta({ id: "管理员模块响应类型" })

export const createAdminModuleSchema = z
  .object({
    name: shape.name,
    routePath: shape.routePath,
    permissionCode: shape.permissionCode,
    parentId: shape.parentId.optional(),
    sort: shape.sort.optional(),
  })
  .meta({ id: "创建管理员模块请求" })

export const updateAdminModuleSchema = z
  .object({
    moduleId: shape.moduleId,
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
    sort: shape.sort.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新管理员模块请求" })

export const deleteAdminModuleSchema = z
  .object({
    moduleId: shape.moduleId,
  })
  .meta({ id: "删除管理员模块请求" })

export const adminModuleListQuerySchema = z
  .object({
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询管理员模块分页列表请求" })

export const adminModuleAllQuerySchema = z
  .object({
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
  })
  .meta({ id: "查询管理员模块全量列表请求" })

const adminModulePageItemSchema = z.object({
  moduleId: shape.moduleId,
  parentId: shape.parentId,
  parentModuleName: shape.parentModuleName,
  name: shape.name,
  routePath: shape.routePath,
  permissionCode: shape.permissionCode,
  sort: shape.sort,
  isDeleted: shape.isDeleted,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
})

export const adminModulePageResponseSchema = z
  .object({
    list: z.array(adminModulePageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "管理员模块分页响应" })

export const adminModuleListResponseSchema = z.array(adminModuleResponseSchema).meta({ id: "管理员模块列表响应" })

export type AdminModule = z.infer<typeof adminModuleResponseSchema>
export type CreateAdminModule = z.infer<typeof createAdminModuleSchema>
export type UpdateAdminModule = z.infer<typeof updateAdminModuleSchema>
