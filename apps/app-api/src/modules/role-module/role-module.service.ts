import type { AppRoleModule } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authRoleModule: roleModuleSchema } = pgSchema

@Injectable()
export class RoleModuleService {
  constructor(private readonly pg: PgService) {}

  async find(roleId: string, moduleId: string): Promise<AppRoleModule> {
    const rows = await this.pg.pdb
      .select({
        roleId: roleModuleSchema.roleId,
        moduleId: roleModuleSchema.moduleId,
        createdAt: roleModuleSchema.createdAt,
      })
      .from(roleModuleSchema)
      .where(and(eq(roleModuleSchema.roleId, roleId), eq(roleModuleSchema.moduleId, moduleId)))
    const row = rows[0]
    if (!row) throw new NotFoundException("角色模块关联不存在")
    return {
      ...row,
      createdAt: toIsoString(row.createdAt),
    }
  }

  async list(query: {
    roleId?: string
    moduleId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppRoleModule>> {
    const where: Parameters<typeof and> = []
    if (query.roleId) where.push(eq(roleModuleSchema.roleId, query.roleId))
    if (query.moduleId) where.push(eq(roleModuleSchema.moduleId, query.moduleId))

    const pageParams = normalizePage(query)

    const countQb = this.pg.pdb.select({ count: sql<number>`count(*)` }).from(roleModuleSchema)
    if (where.length) {
      countQb.where(and(...where))
    }
    const totalRows = await countQb
    const total = Number(totalRows[0]?.count ?? 0)

    const qb = this.pg.pdb
      .select({
        roleId: roleModuleSchema.roleId,
        moduleId: roleModuleSchema.moduleId,
        createdAt: roleModuleSchema.createdAt,
      })
      .from(roleModuleSchema)
    if (where.length) {
      qb.where(and(...where))
    }
    const rows = await qb.orderBy(desc(roleModuleSchema.createdAt)).limit(pageParams.limit).offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
