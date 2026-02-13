import type { CreateTransaction, Transaction, UpdateTransaction } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, between, desc, eq, ilike, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeTransaction } = pgSchema

@Injectable()
export class TransactionService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Transaction> {
    const rows = await this.pg.pdb
      .select({
        id: financeTransaction.id,
        familyId: financeTransaction.familyId,
        accountId: financeTransaction.accountId,
        toAccountId: financeTransaction.toAccountId,
        categoryId: financeTransaction.categoryId,
        amount: financeTransaction.amount,
        type: financeTransaction.type,
        occurredAt: financeTransaction.occurredAt,
        description: financeTransaction.description,
        isDeleted: financeTransaction.isDeleted,
        createdBy: financeTransaction.createdBy,
        createdAt: financeTransaction.createdAt,
        updatedAt: financeTransaction.updatedAt,
      })
      .from(financeTransaction)
      .where(and(eq(financeTransaction.id, id), eq(financeTransaction.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Transaction not found")

    return row as unknown as Transaction
  }

  async create(dto: CreateTransaction & { id: string }): Promise<Transaction> {
    const [inserted] = await this.pg.pdb
      .insert(financeTransaction)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        accountId: dto.accountId,
        toAccountId: dto.toAccountId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        type: dto.type,
        occurredAt: new Date(dto.occurredAt),
        description: dto.description,
      })
      .returning({ id: financeTransaction.id })

    return this.find(inserted.id)
  }

  async update(dto: UpdateTransaction): Promise<Transaction> {
    await this.pg.pdb
      .update(financeTransaction)
      .set({
        ...(dto.accountId !== undefined ? { accountId: dto.accountId } : {}),
        ...(dto.toAccountId !== undefined ? { toAccountId: dto.toAccountId } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.occurredAt !== undefined ? { occurredAt: new Date(dto.occurredAt) } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      })
      .where(eq(financeTransaction.id, dto.id))

    return this.find(dto.id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeTransaction)
      .set({ isDeleted: true })
      .where(eq(financeTransaction.id, id))
      .returning({ id: financeTransaction.id })

    if (!deleted) throw new NotFoundException("Transaction not found")
    return true
  }

  async list(query: {
    familyId: string
    accountId?: string
    categoryId?: string
    type?: string
    startDate?: string
    endDate?: string
    keyword?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Transaction>> {
    const where: Parameters<typeof and> = [
      eq(financeTransaction.familyId, query.familyId),
      eq(financeTransaction.isDeleted, false),
    ]

    if (query.accountId) {
      where.push(eq(financeTransaction.accountId, query.accountId))
    }
    if (query.categoryId) {
      where.push(eq(financeTransaction.categoryId, query.categoryId))
    }
    if (query.type) {
      where.push(eq(financeTransaction.type, query.type))
    }
    if (query.startDate && query.endDate) {
      where.push(between(financeTransaction.occurredAt, new Date(query.startDate), new Date(query.endDate)))
    }
    if (query.keyword) {
      where.push(ilike(financeTransaction.description, `%${query.keyword}%`))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeTransaction)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeTransaction.id,
        familyId: financeTransaction.familyId,
        accountId: financeTransaction.accountId,
        toAccountId: financeTransaction.toAccountId,
        categoryId: financeTransaction.categoryId,
        amount: financeTransaction.amount,
        type: financeTransaction.type,
        occurredAt: financeTransaction.occurredAt,
        description: financeTransaction.description,
        isDeleted: financeTransaction.isDeleted,
        createdBy: financeTransaction.createdBy,
        createdAt: financeTransaction.createdAt,
        updatedAt: financeTransaction.updatedAt,
      })
      .from(financeTransaction)
      .where(and(...where))
      .orderBy(desc(financeTransaction.occurredAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(
      pageParams,
      total,
      rows.map((r) => ({
        ...r,
        occurredAt: r.occurredAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as unknown as Transaction[],
    )
  }
}
