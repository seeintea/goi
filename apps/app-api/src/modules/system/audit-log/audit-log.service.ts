import type { AuditLog } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable } from "@nestjs/common"
import { and, between, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { sysAuditLog } = pgSchema

@Injectable()
export class AuditLogService {
  constructor(private readonly pg: PgService) {}

  async list(query: {
    familyId: string
    userId?: string
    targetEntity?: string
    targetId?: string
    startDate?: string
    endDate?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AuditLog>> {
    const where: Parameters<typeof and> = [eq(sysAuditLog.familyId, query.familyId)]

    if (query.userId) {
      where.push(eq(sysAuditLog.userId, query.userId))
    }
    if (query.targetEntity) {
      where.push(eq(sysAuditLog.targetEntity, query.targetEntity))
    }
    if (query.targetId) {
      where.push(eq(sysAuditLog.targetId, query.targetId))
    }
    if (query.startDate && query.endDate) {
      where.push(between(sysAuditLog.createdAt, new Date(query.startDate), new Date(query.endDate)))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(sysAuditLog)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: sysAuditLog.id,
        familyId: sysAuditLog.familyId,
        userId: sysAuditLog.userId,
        targetEntity: sysAuditLog.targetEntity,
        targetId: sysAuditLog.targetId,
        action: sysAuditLog.action,
        changes: sysAuditLog.changes,
        createdAt: sysAuditLog.createdAt,
      })
      .from(sysAuditLog)
      .where(and(...where))
      .orderBy(desc(sysAuditLog.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(pageParams, total, rows as AuditLog[])
  }
}
