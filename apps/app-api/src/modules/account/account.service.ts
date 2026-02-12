import type { Account, CreateAccount, UpdateAccount } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeAccount } = pgSchema

@Injectable()
export class AccountService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Account> {
    const rows = await this.pg.pdb
      .select({
        id: financeAccount.id,
        familyId: financeAccount.familyId,
        name: financeAccount.name,
        type: financeAccount.type,
        balance: financeAccount.balance,
        currencyCode: financeAccount.currencyCode,
        creditLimit: financeAccount.creditLimit,
        billingDay: financeAccount.billingDay,
        dueDay: financeAccount.dueDay,
        excludeFromStats: financeAccount.excludeFromStats,
        archived: financeAccount.archived,
        sortOrder: financeAccount.sortOrder,
        isDeleted: financeAccount.isDeleted,
        createdAt: financeAccount.createdAt,
        updatedAt: financeAccount.updatedAt,
      })
      .from(financeAccount)
      .where(and(eq(financeAccount.id, id), eq(financeAccount.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Account not found")

    return row as Account
  }

  async create(dto: CreateAccount & { id: string }): Promise<Account> {
    const [inserted] = await this.pg.pdb
      .insert(financeAccount)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        name: dto.name,
        type: dto.type,
        balance: dto.balance,
        currencyCode: dto.currencyCode,
        creditLimit: dto.creditLimit,
        billingDay: dto.billingDay,
        dueDay: dto.dueDay,
        excludeFromStats: dto.excludeFromStats ?? false,
        archived: dto.archived ?? false,
        sortOrder: dto.sortOrder ?? 0,
      })
      .returning({ id: financeAccount.id })

    return this.find(inserted.id)
  }

  async update(dto: UpdateAccount): Promise<Account> {
    await this.pg.pdb
      .update(financeAccount)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.balance !== undefined ? { balance: dto.balance } : {}),
        ...(dto.currencyCode !== undefined ? { currencyCode: dto.currencyCode } : {}),
        ...(dto.creditLimit !== undefined ? { creditLimit: dto.creditLimit } : {}),
        ...(dto.billingDay !== undefined ? { billingDay: dto.billingDay } : {}),
        ...(dto.dueDay !== undefined ? { dueDay: dto.dueDay } : {}),
        ...(dto.excludeFromStats !== undefined ? { excludeFromStats: dto.excludeFromStats } : {}),
        ...(dto.archived !== undefined ? { archived: dto.archived } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      })
      .where(eq(financeAccount.id, dto.id))

    return this.find(dto.id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeAccount)
      .set({ isDeleted: true })
      .where(eq(financeAccount.id, id))
      .returning({
        id: financeAccount.id,
      })

    if (!deleted) throw new NotFoundException("Account not found")
    return true
  }

  async list(query: {
    familyId: string
    name?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Account>> {
    const where: Parameters<typeof and> = [
      eq(financeAccount.familyId, query.familyId),
      eq(financeAccount.isDeleted, false),
    ]

    if (query.name) {
      where.push(ilike(financeAccount.name, `%${query.name}%`))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeAccount)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeAccount.id,
        familyId: financeAccount.familyId,
        name: financeAccount.name,
        type: financeAccount.type,
        balance: financeAccount.balance,
        currencyCode: financeAccount.currencyCode,
        creditLimit: financeAccount.creditLimit,
        billingDay: financeAccount.billingDay,
        dueDay: financeAccount.dueDay,
        excludeFromStats: financeAccount.excludeFromStats,
        archived: financeAccount.archived,
        sortOrder: financeAccount.sortOrder,
        createdAt: financeAccount.createdAt,
        updatedAt: financeAccount.updatedAt,
      })
      .from(financeAccount)
      .where(and(...where))
      .orderBy(desc(financeAccount.sortOrder), desc(financeAccount.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(pageParams, total, rows as Account[])
  }
}
