import type { CreateTag, Tag, UpdateTag } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeTag } = pgSchema

@Injectable()
export class TagService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Tag> {
    const rows = await this.pg.pdb
      .select({
        id: financeTag.id,
        familyId: financeTag.familyId,
        name: financeTag.name,
        color: financeTag.color,
        isDeleted: financeTag.isDeleted,
        createdAt: financeTag.createdAt,
      })
      .from(financeTag)
      .where(and(eq(financeTag.id, id), eq(financeTag.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Tag not found")

    return row as Tag
  }

  async create(dto: CreateTag & { id: string }): Promise<Tag> {
    const [inserted] = await this.pg.pdb
      .insert(financeTag)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        name: dto.name,
        color: dto.color,
      })
      .returning({ id: financeTag.id })

    return this.find(inserted.id)
  }

  async update(dto: UpdateTag): Promise<Tag> {
    await this.pg.pdb
      .update(financeTag)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
      })
      .where(eq(financeTag.id, dto.id))

    return this.find(dto.id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeTag)
      .set({ isDeleted: true })
      .where(eq(financeTag.id, id))
      .returning({
        id: financeTag.id,
      })

    if (!deleted) throw new NotFoundException("Tag not found")
    return true
  }

  async list(query: {
    familyId: string
    name?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Tag>> {
    const where: Parameters<typeof and> = [eq(financeTag.familyId, query.familyId), eq(financeTag.isDeleted, false)]

    if (query.name) {
      where.push(ilike(financeTag.name, `%${query.name}%`))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeTag)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeTag.id,
        familyId: financeTag.familyId,
        name: financeTag.name,
        color: financeTag.color,
        isDeleted: financeTag.isDeleted,
        createdAt: financeTag.createdAt,
      })
      .from(financeTag)
      .where(and(...where))
      .orderBy(desc(financeTag.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(pageParams, total, rows as Tag[])
  }
}
