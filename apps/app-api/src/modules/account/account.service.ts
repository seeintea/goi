import { financeAccount } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { AccountListQueryDto, CreateAccountDto, UpdateAccountDto } from "./account.dto"

@Injectable()
export class AccountService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateAccountDto) {
    const [created] = await this.db.insert(financeAccount).values(dto).returning()
    return created
  }

  async findAll(query: AccountListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeAccount.familyId, query.familyId)]
    if (query.name) {
      conditions.push(ilike(financeAccount.name, `%${query.name}%`))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeAccount).where(where)
    const items = await this.db
      .select()
      .from(financeAccount)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeAccount.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeAccount).where(eq(financeAccount.id, id))
    if (!item) throw new NotFoundException("Account not found")
    return item
  }

  async update(id: string, dto: UpdateAccountDto) {
    const [updated] = await this.db.update(financeAccount).set(dto).where(eq(financeAccount.id, id)).returning()
    if (!updated) throw new NotFoundException("Account not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeAccount).where(eq(financeAccount.id, id)).returning()
    if (!deleted) throw new NotFoundException("Account not found")
    return deleted
  }
}
