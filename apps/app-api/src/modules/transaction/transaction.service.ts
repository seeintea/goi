import { financeTransaction } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, between, count, desc, eq, ilike } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { CreateTransactionDto, TransactionListQueryDto, UpdateTransactionDto } from "./transaction.dto"

@Injectable()
export class TransactionService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateTransactionDto) {
    const [created] = await this.db.insert(financeTransaction).values(dto).returning()
    return created
  }

  async findAll(query: TransactionListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeTransaction.familyId, query.familyId)]

    if (query.accountId) {
      conditions.push(eq(financeTransaction.accountId, query.accountId))
    }
    if (query.categoryId) {
      conditions.push(eq(financeTransaction.categoryId, query.categoryId))
    }
    if (query.type) {
      conditions.push(eq(financeTransaction.type, query.type))
    }
    if (query.startDate && query.endDate) {
      conditions.push(between(financeTransaction.occurredAt, new Date(query.startDate), new Date(query.endDate)))
    }
    if (query.keyword) {
      conditions.push(ilike(financeTransaction.description, `%${query.keyword}%`))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeTransaction).where(where)
    const items = await this.db
      .select()
      .from(financeTransaction)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeTransaction.occurredAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeTransaction).where(eq(financeTransaction.id, id))
    if (!item) throw new NotFoundException("Transaction not found")
    return item
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const [updated] = await this.db.update(financeTransaction).set(dto).where(eq(financeTransaction.id, id)).returning()
    if (!updated) throw new NotFoundException("Transaction not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeTransaction).where(eq(financeTransaction.id, id)).returning()
    if (!deleted) throw new NotFoundException("Transaction not found")
    return deleted
  }
}
