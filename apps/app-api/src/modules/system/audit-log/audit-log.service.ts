import { sysAuditLog } from "@goi/infra"
import { Inject, Injectable } from "@nestjs/common"
import { and, between, count, desc, eq } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { AuditLogListQueryDto } from "./audit-log.dto"

@Injectable()
export class AuditLogService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async findAll(query: AuditLogListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(sysAuditLog.familyId, query.familyId)]

    if (query.userId) {
      conditions.push(eq(sysAuditLog.userId, query.userId))
    }
    if (query.targetEntity) {
      conditions.push(eq(sysAuditLog.targetEntity, query.targetEntity))
    }
    if (query.targetId) {
      conditions.push(eq(sysAuditLog.targetId, query.targetId))
    }
    if (query.startDate && query.endDate) {
      conditions.push(between(sysAuditLog.createdAt, new Date(query.startDate), new Date(query.endDate)))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(sysAuditLog).where(where)
    const items = await this.db
      .select()
      .from(sysAuditLog)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(sysAuditLog.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }
}
