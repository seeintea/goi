import type { Budget, CreateBudget, UpdateBudget } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeBudget } = pgSchema

@Injectable()
export class BudgetService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Budget> {
    const rows = await this.pg.pdb
      .select({
        id: financeBudget.id,
        familyId: financeBudget.familyId,
        categoryId: financeBudget.categoryId,
        amount: financeBudget.amount,
        periodType: financeBudget.periodType,
        startDate: financeBudget.startDate,
        endDate: financeBudget.endDate,
        isDeleted: financeBudget.isDeleted,
        createdAt: financeBudget.createdAt,
        updatedAt: financeBudget.updatedAt,
      })
      .from(financeBudget)
      .where(and(eq(financeBudget.id, id), eq(financeBudget.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Budget not found")

    return {
      ...row,
      // Ensure types match Budget interface
      startDate: row.startDate, // Assuming string or Date matches
      endDate: row.endDate,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    } as unknown as Budget
  }

  async create(dto: CreateBudget & { id: string }): Promise<Budget> {
    const [inserted] = await this.pg.pdb
      .insert(financeBudget)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        periodType: dto.periodType,
        startDate: dto.startDate,
        endDate: dto.endDate,
      })
      .returning({ id: financeBudget.id })

    return this.find(inserted.id)
  }

  async update(dto: UpdateBudget): Promise<Budget> {
    await this.pg.pdb
      .update(financeBudget)
      .set({
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.periodType !== undefined ? { periodType: dto.periodType } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
      })
      .where(eq(financeBudget.id, dto.id))

    return this.find(dto.id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeBudget)
      .set({ isDeleted: true })
      .where(eq(financeBudget.id, id))
      .returning({ id: financeBudget.id })

    if (!deleted) throw new NotFoundException("Budget not found")
    return true
  }

  async list(query: {
    familyId: string
    periodType?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Budget>> {
    const where: Parameters<typeof and> = [
      eq(financeBudget.familyId, query.familyId),
      eq(financeBudget.isDeleted, false),
    ]

    if (query.periodType) {
      where.push(eq(financeBudget.periodType, query.periodType))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeBudget)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeBudget.id,
        familyId: financeBudget.familyId,
        categoryId: financeBudget.categoryId,
        amount: financeBudget.amount,
        periodType: financeBudget.periodType,
        startDate: financeBudget.startDate,
        endDate: financeBudget.endDate,
        isDeleted: financeBudget.isDeleted,
        createdAt: financeBudget.createdAt,
        updatedAt: financeBudget.updatedAt,
      })
      .from(financeBudget)
      .where(and(...where))
      .orderBy(desc(financeBudget.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(
      pageParams,
      total,
      rows.map((r) => ({
        ...r,
        startDate: r.startDate,
        endDate: r.endDate,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as unknown as Budget[],
    )
  }
}
