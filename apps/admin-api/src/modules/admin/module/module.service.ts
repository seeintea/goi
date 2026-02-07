import type { AdminModule, CreateAdminModule, UpdateAdminModule } from "@goi/contracts/admin/module"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, isNull, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { adminModule: adminModuleSchema } = pgSchema

@Injectable()
export class ModuleService {
  constructor(private readonly pg: PgService) {}

  async find(moduleId: string): Promise<AdminModule> {
    const modules = await this.pg.pdb
      .select({
        moduleId: adminModuleSchema.moduleId,
        parentId: adminModuleSchema.parentId,
        name: adminModuleSchema.name,
        routePath: adminModuleSchema.routePath,
        permissionCode: adminModuleSchema.permissionCode,
        sort: adminModuleSchema.sort,
        isDeleted: adminModuleSchema.isDeleted,
        createTime: adminModuleSchema.createTime,
        updateTime: adminModuleSchema.updateTime,
      })
      .from(adminModuleSchema)
      .where(and(eq(adminModuleSchema.moduleId, moduleId), eq(adminModuleSchema.isDeleted, false)))
      .limit(1)

    const moduleRow = modules[0]
    if (!moduleRow) throw new NotFoundException("管理员模块不存在")

    return {
      ...moduleRow,
      createTime: toIsoString(moduleRow.createTime),
      updateTime: toIsoString(moduleRow.updateTime),
    }
  }

  async create(values: CreateAdminModule & { moduleId: string }): Promise<AdminModule> {
    await this.pg.pdb.insert(adminModuleSchema).values({
      moduleId: values.moduleId,
      parentId: values.parentId ?? null,
      name: values.name,
      routePath: values.routePath,
      permissionCode: values.permissionCode,
      sort: values.sort ?? 0,
      isDeleted: false,
    })
    return this.find(values.moduleId)
  }

  async update(values: UpdateAdminModule): Promise<AdminModule> {
    await this.pg.pdb
      .update(adminModuleSchema)
      .set({
        ...(values.parentId !== undefined ? { parentId: values.parentId } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.routePath !== undefined ? { routePath: values.routePath } : {}),
        ...(values.permissionCode !== undefined ? { permissionCode: values.permissionCode } : {}),
        ...(values.sort !== undefined ? { sort: values.sort } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(adminModuleSchema.moduleId, values.moduleId))

    return this.find(values.moduleId)
  }

  async delete(moduleId: string): Promise<boolean> {
    await this.pg.pdb
      .update(adminModuleSchema)
      .set({ isDeleted: true })
      .where(eq(adminModuleSchema.moduleId, moduleId))
    return true
  }

  async all(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
  }): Promise<AdminModule[]> {
    const where: Parameters<typeof and> = [eq(adminModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(adminModuleSchema.parentId))
    if (query.parentId) where.push(eq(adminModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(adminModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(adminModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(adminModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const rows = await this.pg.pdb
      .select({
        moduleId: adminModuleSchema.moduleId,
        parentId: adminModuleSchema.parentId,
        name: adminModuleSchema.name,
        routePath: adminModuleSchema.routePath,
        permissionCode: adminModuleSchema.permissionCode,
        sort: adminModuleSchema.sort,
        isDeleted: adminModuleSchema.isDeleted,
        createTime: adminModuleSchema.createTime,
        updateTime: adminModuleSchema.updateTime,
      })
      .from(adminModuleSchema)
      .where(and(...where))
      .orderBy(asc(adminModuleSchema.sort), desc(adminModuleSchema.createTime))

    return rows.map((row) => ({
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }))
  }

  async roots(): Promise<AdminModule[]> {
    return this.all({ parentId: null })
  }

  async list(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AdminModule>> {
    const where: Parameters<typeof and> = [eq(adminModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(adminModuleSchema.parentId))
    if (query.parentId) where.push(eq(adminModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(adminModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(adminModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(adminModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(adminModuleSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        moduleId: adminModuleSchema.moduleId,
        parentId: adminModuleSchema.parentId,
        name: adminModuleSchema.name,
        routePath: adminModuleSchema.routePath,
        permissionCode: adminModuleSchema.permissionCode,
        sort: adminModuleSchema.sort,
        isDeleted: adminModuleSchema.isDeleted,
        createTime: adminModuleSchema.createTime,
        updateTime: adminModuleSchema.updateTime,
      })
      .from(adminModuleSchema)
      .where(and(...where))
      .orderBy(asc(adminModuleSchema.sort), desc(adminModuleSchema.createTime))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }))

    return toPageResult(pageParams, total, list)
  }
}
