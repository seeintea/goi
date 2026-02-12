import type { AppModule, CreateAppModule, UpdateAppModule } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, isNull, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authModule: authModuleSchema } = pgSchema

@Injectable()
export class ModuleService {
  constructor(private readonly pg: PgService) {}

  async find(moduleId: string): Promise<AppModule> {
    const modules = await this.pg.pdb
      .select({
        moduleId: authModuleSchema.moduleId,
        parentId: authModuleSchema.parentId,
        name: authModuleSchema.name,
        routePath: authModuleSchema.routePath,
        permissionCode: authModuleSchema.permissionCode,
        sort: authModuleSchema.sort,
        isDeleted: authModuleSchema.isDeleted,
        createdAt: authModuleSchema.createdAt,
        updatedAt: authModuleSchema.updatedAt,
      })
      .from(authModuleSchema)
      .where(and(eq(authModuleSchema.moduleId, moduleId), eq(authModuleSchema.isDeleted, false)))
      .limit(1)

    const moduleRow = modules[0]
    if (!moduleRow) throw new NotFoundException("模块不存在")

    return {
      ...moduleRow,
      createdAt: toIsoString(moduleRow.createdAt),
      updatedAt: toIsoString(moduleRow.updatedAt),
    }
  }

  async create(values: CreateAppModule & { moduleId: string }): Promise<AppModule> {
    await this.pg.pdb.insert(authModuleSchema).values({
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

  async update(values: UpdateAppModule): Promise<AppModule> {
    await this.pg.pdb
      .update(authModuleSchema)
      .set({
        ...(values.parentId !== undefined ? { parentId: values.parentId } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.routePath !== undefined ? { routePath: values.routePath } : {}),
        ...(values.permissionCode !== undefined ? { permissionCode: values.permissionCode } : {}),
        ...(values.sort !== undefined ? { sort: values.sort } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(authModuleSchema.moduleId, values.moduleId))

    return this.find(values.moduleId)
  }

  async delete(moduleId: string): Promise<boolean> {
    await this.pg.pdb.update(authModuleSchema).set({ isDeleted: true }).where(eq(authModuleSchema.moduleId, moduleId))
    return true
  }

  async all(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
  }): Promise<AppModule[]> {
    const where: Parameters<typeof and> = [eq(authModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(authModuleSchema.parentId))
    if (query.parentId) where.push(eq(authModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(authModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(authModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(authModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const rows = await this.pg.pdb
      .select({
        moduleId: authModuleSchema.moduleId,
        parentId: authModuleSchema.parentId,
        name: authModuleSchema.name,
        routePath: authModuleSchema.routePath,
        permissionCode: authModuleSchema.permissionCode,
        sort: authModuleSchema.sort,
        isDeleted: authModuleSchema.isDeleted,
        createdAt: authModuleSchema.createdAt,
        updatedAt: authModuleSchema.updatedAt,
      })
      .from(authModuleSchema)
      .where(and(...where))
      .orderBy(asc(authModuleSchema.sort), desc(authModuleSchema.createdAt))

    return rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))
  }

  async roots(): Promise<AppModule[]> {
    return this.all({ parentId: null })
  }

  async list(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppModule>> {
    const where: Parameters<typeof and> = [eq(authModuleSchema.isDeleted, false)]
    if (query.parentId === null) where.push(isNull(authModuleSchema.parentId))
    if (query.parentId) where.push(eq(authModuleSchema.parentId, query.parentId))
    if (query.name) where.push(like(authModuleSchema.name, `%${query.name}%`))
    if (query.routePath) where.push(like(authModuleSchema.routePath, `%${query.routePath}%`))
    if (query.permissionCode) where.push(like(authModuleSchema.permissionCode, `%${query.permissionCode}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(authModuleSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        moduleId: authModuleSchema.moduleId,
        parentId: authModuleSchema.parentId,
        name: authModuleSchema.name,
        routePath: authModuleSchema.routePath,
        permissionCode: authModuleSchema.permissionCode,
        sort: authModuleSchema.sort,
        isDeleted: authModuleSchema.isDeleted,
        createdAt: authModuleSchema.createdAt,
        updatedAt: authModuleSchema.updatedAt,
      })
      .from(authModuleSchema)
      .where(and(...where))
      .orderBy(asc(authModuleSchema.sort), desc(authModuleSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
