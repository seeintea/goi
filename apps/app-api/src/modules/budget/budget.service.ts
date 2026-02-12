import { financeBudget } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { BudgetListQueryDto, CreateBudgetDto, UpdateBudgetDto } from "./budget.dto"

@Injectable()
export class BudgetService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateBudgetDto) {
    const [created] = await this.db.insert(financeBudget).values(dto).returning()
    return created
  }

  async findAll(query: BudgetListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeBudget.familyId, query.familyId)]
    if (query.periodType) {
      conditions.push(eq(financeBudget.periodType, query.periodType))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeBudget).where(where)
    const items = await this.db
      .select()
      .from(financeBudget)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeBudget.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeBudget).where(eq(financeBudget.id, id))
    if (!item) throw new NotFoundException("Budget not found")
    return item
  }

  async update(id: string, dto: UpdateBudgetDto) {
    const [updated] = await this.db.update(financeBudget).set(dto).where(eq(financeBudget.id, id)).returning()
    if (!updated) throw new NotFoundException("Budget not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeBudget).where(eq(financeBudget.id, id)).returning()
    if (!deleted) throw new NotFoundException("Budget not found")
    return deleted
  }
}
