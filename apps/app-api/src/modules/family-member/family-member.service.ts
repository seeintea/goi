import type { CreateFamilyMember, FamilyMember, UpdateFamilyMember } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeFamilyMember } = pgSchema

@Injectable()
export class FamilyMemberService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<FamilyMember> {
    const rows = await this.pg.pdb
      .select({
        id: financeFamilyMember.id,
        familyId: financeFamilyMember.familyId,
        userId: financeFamilyMember.userId,
        roleId: financeFamilyMember.roleId,
        status: financeFamilyMember.status,
        isDeleted: financeFamilyMember.isDeleted,
        joinedAt: financeFamilyMember.joinedAt,
      })
      .from(financeFamilyMember)
      .where(and(eq(financeFamilyMember.id, id), eq(financeFamilyMember.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("FamilyMember not found")

    return {
      ...row,
      joinedAt: row.joinedAt.toISOString(),
    } as unknown as FamilyMember
  }

  async create(dto: CreateFamilyMember & { id: string }): Promise<FamilyMember> {
    const [inserted] = await this.pg.pdb
      .insert(financeFamilyMember)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        userId: dto.userId,
        roleId: dto.roleId,
        status: dto.status,
      })
      .returning({ id: financeFamilyMember.id })

    return this.find(inserted.id)
  }

  async update(id: string, dto: UpdateFamilyMember): Promise<FamilyMember> {
    await this.pg.pdb
      .update(financeFamilyMember)
      .set({
        ...(dto.roleId !== undefined ? { roleId: dto.roleId } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      })
      .where(eq(financeFamilyMember.id, id))

    return this.find(id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeFamilyMember)
      .set({ isDeleted: true })
      .where(eq(financeFamilyMember.id, id))
      .returning({
        id: financeFamilyMember.id,
      })

    if (!deleted) throw new NotFoundException("FamilyMember not found")
    return true
  }

  async list(query: {
    familyId: string
    roleId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<FamilyMember>> {
    const where: Parameters<typeof and> = [
      eq(financeFamilyMember.familyId, query.familyId),
      eq(financeFamilyMember.isDeleted, false),
    ]

    if (query.roleId) {
      where.push(eq(financeFamilyMember.roleId, query.roleId))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeFamilyMember)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeFamilyMember.id,
        familyId: financeFamilyMember.familyId,
        userId: financeFamilyMember.userId,
        roleId: financeFamilyMember.roleId,
        status: financeFamilyMember.status,
        isDeleted: financeFamilyMember.isDeleted,
        joinedAt: financeFamilyMember.joinedAt,
      })
      .from(financeFamilyMember)
      .where(and(...where))
      .orderBy(desc(financeFamilyMember.joinedAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(
      pageParams,
      total,
      rows.map((r) => ({
        ...r,
        joinedAt: r.joinedAt.toISOString(),
      })) as unknown as FamilyMember[],
    )
  }
}
