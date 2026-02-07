import type { CreateModule, Module, UpdateModule } from "@goi/contracts/app/module"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, isNull, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { sysModule: sysModuleSchema } = pgSchema

@Injectable()
export class ModuleService {
  constructor(private readonly pg: PgService) {}

  async find(moduleId: string): Promise<Module> {
    const modules = await this.pg.pdb
      .select({
        moduleId: sysModuleSchema.moduleId,
        parentId: sysModuleSchema.parentId,
        name: sysModuleSchema.name,
        routePath: sysModuleSchema.routePath,
        permissionCode: sysModuleSchema.permissionCode,
        sort: sysModuleSchema.sort,
        isDeleted: sysModuleSchema.isDeleted,
        createTime: sysModuleSchema.createTime,
        updateTime: sysModuleSchema.updateTime,
      })
      .from(sysModuleSchema)
      .where(and(eq(sysModuleSchema.moduleId, moduleId), eq(sysModuleSchema.isDeleted, false)))
      .limit(1)

    const moduleRow = modules[0]
    if (!moduleRow) throw new NotFoundException("模块不存在")

    return {
      ...moduleRow,
      createTime: toIsoString(moduleRow.createTime),
      updateTime: toIsoString(moduleRow.updateTime),
    }
  }

  async create(values: CreateModule & { moduleId: string }): Promise<Module> {
    await this.pg.pdb.insert(sysModuleSchema).values({
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

  async update(values: UpdateModule): Promise<Module> {
    await this.pg.pdb
      .update(sysModuleSchema)
      .set({
        ...(values.parentId !== undefined ? { parentId: values.parentId } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.routePath !== undefined ? { routePath: values.routePath } : {}),
        ...(values.permissionCode !== undefined ? { permissionCode: values.permissionCode } : {}),
        ...(values.sort !== undefined ? { sort: values.sort } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(sysModuleSchema.moduleId, values.moduleId))

    return this.find(values.moduleId)
  }

  async delete(moduleId: string): Promise<boolean> {
    await this.pg.pdb.update(sysModuleSchema).set({ isDeleted: true }).where(eq(sysModuleSchema.moduleId, moduleId))
    return true
  }

  async all(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
  }): Promise<Module[]> {
    const where: Parameters<typeof and> = [eq(sysModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(sysModuleSchema.parentId))
    if (query.parentId) where.push(eq(sysModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(sysModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(sysModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(sysModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const rows = await this.pg.pdb
      .select({
        moduleId: sysModuleSchema.moduleId,
        parentId: sysModuleSchema.parentId,
        name: sysModuleSchema.name,
        routePath: sysModuleSchema.routePath,
        permissionCode: sysModuleSchema.permissionCode,
        sort: sysModuleSchema.sort,
        isDeleted: sysModuleSchema.isDeleted,
        createTime: sysModuleSchema.createTime,
        updateTime: sysModuleSchema.updateTime,
      })
      .from(sysModuleSchema)
      .where(and(...where))
      .orderBy(asc(sysModuleSchema.sort), desc(sysModuleSchema.createTime))

    return rows.map((row) => ({
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }))
  }

  async roots(): Promise<Module[]> {
    return this.all({ parentId: null })
  }

  async list(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Module>> {
    const where: Parameters<typeof and> = [eq(sysModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(sysModuleSchema.parentId))
    if (query.parentId) where.push(eq(sysModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(sysModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(sysModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(sysModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(sysModuleSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        moduleId: sysModuleSchema.moduleId,
        parentId: sysModuleSchema.parentId,
        name: sysModuleSchema.name,
        routePath: sysModuleSchema.routePath,
        permissionCode: sysModuleSchema.permissionCode,
        sort: sysModuleSchema.sort,
        isDeleted: sysModuleSchema.isDeleted,
        createTime: sysModuleSchema.createTime,
        updateTime: sysModuleSchema.updateTime,
      })
      .from(sysModuleSchema)
      .where(and(...where))
      .orderBy(asc(sysModuleSchema.sort), desc(sysModuleSchema.createTime))
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
