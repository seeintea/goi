import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  moduleId: z.string().length(32).describe("模块ID"),
  parentId: z.string().length(32).nullable().describe("父模块ID"),
  name: z.string().min(1).max(80).describe("模块名称"),
  routePath: z.string().min(1).max(200).describe("前端路由路径"),
  permissionCode: z.string().min(1).max(80).describe("页面权限编码"),
  sort: z.coerce.number().int().min(0).describe("排序值"),
  isDeleted: z.boolean().describe("是否删除"),
  createTime: z.iso.datetime().describe("创建时间"),
  updateTime: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const moduleResponseSchema = z
  .object({
    moduleId: shape.moduleId,
    parentId: shape.parentId,
    name: shape.name,
    routePath: shape.routePath,
    permissionCode: shape.permissionCode,
    sort: shape.sort,
    isDeleted: shape.isDeleted,
    createTime: shape.createTime,
    updateTime: shape.updateTime,
  })
  .meta({ id: "模块响应类型" })

const createModuleSchema = z
  .object({
    name: shape.name,
    routePath: shape.routePath,
    permissionCode: shape.permissionCode,
    parentId: shape.parentId.optional(),
    sort: shape.sort.optional(),
  })
  .meta({ id: "创建模块请求" })

const updateModuleSchema = z
  .object({
    moduleId: shape.moduleId,
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
    sort: shape.sort.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新模块请求" })

const deleteModuleSchema = z
  .object({
    moduleId: shape.moduleId,
  })
  .meta({ id: "删除模块请求" })

const moduleListQuerySchema = z
  .object({
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询模块分页列表请求" })

const moduleAllQuerySchema = z
  .object({
    parentId: shape.parentId.optional(),
    name: shape.name.optional(),
    routePath: shape.routePath.optional(),
    permissionCode: shape.permissionCode.optional(),
  })
  .meta({ id: "查询模块全量列表请求" })

const modulePageItemSchema = z.object({
  moduleId: shape.moduleId,
  parentId: shape.parentId,
  name: shape.name,
  routePath: shape.routePath,
  permissionCode: shape.permissionCode,
  sort: shape.sort,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

const modulePageResponseSchema = z
  .object({
    list: z.array(modulePageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "模块分页响应" })

export class ModuleResponseDto extends createZodDto(moduleResponseSchema) {}
export class CreateModuleDto extends createZodDto(createModuleSchema) {}
export class UpdateModuleDto extends createZodDto(updateModuleSchema) {}
export class DeleteModuleDto extends createZodDto(deleteModuleSchema) {}
export class ModuleListQueryDto extends createZodDto(moduleListQuerySchema) {}
export class ModuleAllQueryDto extends createZodDto(moduleAllQuerySchema) {}
export class ModulePageResponseDto extends createZodDto(modulePageResponseSchema) {}
export class ModuleListResponseDto extends createZodDto(z.array(moduleResponseSchema)) {}

export type Module = z.infer<typeof moduleResponseSchema>
export type CreateModule = z.infer<typeof createModuleSchema>
export type UpdateModule = z.infer<typeof updateModuleSchema>
