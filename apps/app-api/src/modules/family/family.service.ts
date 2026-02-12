import type { CreateFamily, Family, UpdateFamily } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeFamily } = pgSchema

@Injectable()
export class FamilyService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Family> {
    const rows = await this.pg.pdb
      .select({
        id: financeFamily.id,
        name: financeFamily.name,
        ownerUserId: financeFamily.ownerUserId,
        baseCurrency: financeFamily.baseCurrency,
        timezone: financeFamily.timezone,
        isDeleted: financeFamily.isDeleted,
        createdAt: financeFamily.createdAt,
        updatedAt: financeFamily.updatedAt,
      })
      .from(financeFamily)
      .where(and(eq(financeFamily.id, id), eq(financeFamily.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Family not found")

    return row as Family
  }

  async create(userId: string, dto: CreateFamily & { id: string }): Promise<Family> {
    const [inserted] = await this.pg.pdb
      .insert(financeFamily)
      .values({
        id: dto.id,
        name: dto.name,
        ownerUserId: userId,
        baseCurrency: dto.baseCurrency,
        timezone: dto.timezone,
      })
      .returning({ id: financeFamily.id })

    return this.find(inserted.id)
  }

  async update(id: string, dto: UpdateFamily): Promise<Family> {
    await this.pg.pdb
      .update(financeFamily)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.baseCurrency !== undefined ? { baseCurrency: dto.baseCurrency } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      })
      .where(eq(financeFamily.id, id))

    return this.find(id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeFamily)
      .set({ isDeleted: true })
      .where(eq(financeFamily.id, id))
      .returning({
        id: financeFamily.id,
      })

    if (!deleted) throw new NotFoundException("Family not found")
    return true
  }

  async list(query: {
    name?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Family>> {
    const where: Parameters<typeof and> = []

    if (query.name) {
      where.push(ilike(financeFamily.name, `%${query.name}%`))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeFamily)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeFamily.id,
        name: financeFamily.name,
        ownerUserId: financeFamily.ownerUserId,
        baseCurrency: financeFamily.baseCurrency,
        timezone: financeFamily.timezone,
        isDeleted: financeFamily.isDeleted,
        createdAt: financeFamily.createdAt,
        updatedAt: financeFamily.updatedAt,
      })
      .from(financeFamily)
      .where(and(...where))
      .orderBy(desc(financeFamily.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(pageParams, total, rows as Family[])
  }
}
