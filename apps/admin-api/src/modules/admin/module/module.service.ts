import type { AdminModule, CreateAdminModule, UpdateAdminModule } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, inArray, isNull, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import { RedisService } from "@/database/redis"
import type { PageResult } from "@/types/response"

const { adminModule: adminModuleSchema } = pgSchema
const MODULE_NAMES_CACHE_KEY = "admin:module:names"

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
          moduleId: adminModuleSchema.moduleId,
          name: adminModuleSchema.name,
        })
        .from(adminModuleSchema)
        .where(inArray(adminModuleSchema.moduleId, missingIds))

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
        createdAt: adminModuleSchema.createdAt,
        updatedAt: adminModuleSchema.updatedAt,
      })
      .from(adminModuleSchema)
      .where(and(eq(adminModuleSchema.moduleId, moduleId), eq(adminModuleSchema.isDeleted, false)))
      .limit(1)

    const moduleRow = modules[0]
    if (!moduleRow) throw new NotFoundException("管理员模块不存在")

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

    // Update cache
    await this.redisService.hSet(MODULE_NAMES_CACHE_KEY, values.moduleId, values.name)

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
      })
      .where(eq(adminModuleSchema.moduleId, values.moduleId))

    // Update cache if name changed
    if (values.name) {
      await this.redisService.hSet(MODULE_NAMES_CACHE_KEY, values.moduleId, values.name)
    }

    return this.find(values.moduleId)
  }

  async delete(moduleId: string): Promise<boolean> {
    await this.pg.pdb.update(adminModuleSchema).set({ isDeleted: true }).where(eq(adminModuleSchema.moduleId, moduleId))

    // Invalidate cache
    await this.redisService.hDel(MODULE_NAMES_CACHE_KEY, moduleId)

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
        createdAt: adminModuleSchema.createdAt,
        updatedAt: adminModuleSchema.updatedAt,
      })
      .from(adminModuleSchema)
      .where(and(...where))
      .orderBy(asc(adminModuleSchema.sort), desc(adminModuleSchema.createdAt))

    const parentIds = rows.map((r) => r.parentId).filter((id): id is string => !!id)
    const moduleNames = await this.getModuleNames(parentIds)

    return rows.map((row) => ({
      ...row,
      parentModuleName: row.parentId ? moduleNames[row.parentId] : null,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
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
        createdAt: adminModuleSchema.createdAt,
        updatedAt: adminModuleSchema.updatedAt,
      })
      .from(adminModuleSchema)
      .where(and(...where))
      .orderBy(asc(adminModuleSchema.sort), desc(adminModuleSchema.createdAt))
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
