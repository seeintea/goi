import type { AppModule, CreateAppModule, UpdateAppModule } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, inArray, isNotNull, isNull, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import { RedisService } from "@/database/redis"
import type { PageResult } from "@/types/response"

const { authModule: authModuleSchema } = pgSchema
const MODULE_NAMES_CACHE_KEY = "app:module:names"

@Injectable()
export class ModuleService {
  constructor(
    private readonly pg: PgService,
    private readonly redisService: RedisService,
  ) {}

  async getModuleNames(moduleIds: string[]): Promise<Record<string, string>> {
    if (moduleIds.length === 0) return {}

    // 1. Try to get from Redis
    const cachedNames = await this.redisService.hmGet(MODULE_NAMES_CACHE_KEY, ...moduleIds)
    const result: Record<string, string> = {}
    const missingIds: string[] = []

    moduleIds.forEach((id, index) => {
      const name = cachedNames[index]
      if (name) {
        result[id] = name
      } else {
        missingIds.push(id)
      }
    })

    // 2. Fetch missing from DB
    if (missingIds.length > 0) {
      const modules = await this.pg.pdb
        .select({
          moduleId: authModuleSchema.moduleId,
          name: authModuleSchema.name,
        })
        .from(authModuleSchema)
        .where(inArray(authModuleSchema.moduleId, missingIds))

      if (modules.length > 0) {
        const updates: Record<string, string> = {}
        for (const m of modules) {
          result[m.moduleId] = m.name
          updates[m.moduleId] = m.name
        }
        // 3. Update Redis
        await this.redisService.hmSet(MODULE_NAMES_CACHE_KEY, updates)
      }
    }

    return result
  }

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

    let parentModuleName: string | null = null
    if (moduleRow.parentId) {
      const names = await this.getModuleNames([moduleRow.parentId])
      parentModuleName = names[moduleRow.parentId] || null
    }

    return {
      ...moduleRow,
      parentModuleName,
      createdAt: toIsoString(moduleRow.createdAt),
      updatedAt: toIsoString(moduleRow.updatedAt),
    }
  }

  async create(values: CreateAppModule & { moduleId: string }): Promise<AppModule> {
    // Calculate sort order if not provided
    let sort = values.sort
    if (sort === undefined) {
      const where = values.parentId
        ? and(eq(authModuleSchema.parentId, values.parentId), eq(authModuleSchema.isDeleted, false))
        : and(isNull(authModuleSchema.parentId), eq(authModuleSchema.isDeleted, false))

      const maxSortResult = await this.pg.pdb
        .select({ maxSort: sql<number>`max(${authModuleSchema.sort})` })
        .from(authModuleSchema)
        .where(where)

      sort = (Number(maxSortResult[0]?.maxSort) || 0) + 1
    }

    await this.pg.pdb.insert(authModuleSchema).values({
      moduleId: values.moduleId,
      parentId: values.parentId ?? null,
      name: values.name,
      routePath: values.routePath,
      permissionCode: values.permissionCode,
      sort: sort,
      isDeleted: false,
    })

    // Update cache
    await this.redisService.hSet(MODULE_NAMES_CACHE_KEY, values.moduleId, values.name)

    return this.find(values.moduleId)
  }

  async updateSort(values: { parentId: string | null; moduleIds: string[] }): Promise<boolean> {
    const { moduleIds } = values
    if (moduleIds.length === 0) return true

    await this.pg.pdb.transaction(async (tx) => {
      for (let i = 0; i < moduleIds.length; i++) {
        await tx
          .update(authModuleSchema)
          .set({ sort: i + 1 })
          .where(eq(authModuleSchema.moduleId, moduleIds[i]))
      }
    })

    return true
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

    // Update cache if name changed
    if (values.name) {
      await this.redisService.hSet(MODULE_NAMES_CACHE_KEY, values.moduleId, values.name)
    }

    return this.find(values.moduleId)
  }

  async delete(moduleId: string): Promise<boolean> {
    await this.pg.pdb.update(authModuleSchema).set({ isDeleted: true }).where(eq(authModuleSchema.moduleId, moduleId))

    // Invalidate cache
    await this.redisService.hDel(MODULE_NAMES_CACHE_KEY, moduleId)

    return true
  }

  async all(query: {
    parentId?: string | null
    name?: string
    routePath?: string
    permissionCode?: string
  }): Promise<AppModule[]> {
    const where: Parameters<typeof and> = [eq(authModuleSchema.isDeleted, false)]
    if (query.parentId === "global" || query.parentId === null) {
      where.push(isNull(authModuleSchema.parentId))
    } else if (query.parentId) {
      where.push(eq(authModuleSchema.parentId, query.parentId))
    }
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

    const parentIds = rows.map((r) => r.parentId).filter((id): id is string => !!id)
    const moduleNames = await this.getModuleNames(parentIds)

    return rows.map((row) => ({
      ...row,
      parentModuleName: row.parentId ? moduleNames[row.parentId] : null,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))
  }

  async parents(): Promise<AppModule[]> {
    // Subquery to find modules that are referenced as parentId by other modules
    const children = this.pg.pdb
      .select({ parentId: authModuleSchema.parentId })
      .from(authModuleSchema)
      .where(and(eq(authModuleSchema.isDeleted, false), isNotNull(authModuleSchema.parentId)))
      .groupBy(authModuleSchema.parentId)

    // Find modules whose ID is in the children's parentId list
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
      .where(and(eq(authModuleSchema.isDeleted, false), inArray(authModuleSchema.moduleId, children)))
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
    if (query.parentId === "global" || query.parentId === null) {
      where.push(isNull(authModuleSchema.parentId))
    } else if (query.parentId) {
      where.push(eq(authModuleSchema.parentId, query.parentId))
    }
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
      .orderBy(desc(authModuleSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const parentIds = rows.map((r) => r.parentId).filter((id): id is string => !!id)
    const moduleNames = await this.getModuleNames(parentIds)

    const list = rows.map((row) => ({
      ...row,
      parentModuleName: row.parentId ? moduleNames[row.parentId] : null,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
