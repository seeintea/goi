import { financeCategory } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { CategoryListQueryDto, CreateCategoryDto, UpdateCategoryDto } from "./category.dto"

@Injectable()
export class CategoryService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateCategoryDto) {
    const [created] = await this.db.insert(financeCategory).values(dto).returning()
    return created
  }

  async findAll(query: CategoryListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeCategory.familyId, query.familyId)]
    if (query.name) {
      conditions.push(ilike(financeCategory.name, `%${query.name}%`))
    }
    if (query.type) {
      conditions.push(eq(financeCategory.type, query.type))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeCategory).where(where)
    const items = await this.db
      .select()
      .from(financeCategory)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeCategory.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeCategory).where(eq(financeCategory.id, id))
    if (!item) throw new NotFoundException("Category not found")
    return item
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const [updated] = await this.db.update(financeCategory).set(dto).where(eq(financeCategory.id, id)).returning()
    if (!updated) throw new NotFoundException("Category not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeCategory).where(eq(financeCategory.id, id)).returning()
    if (!deleted) throw new NotFoundException("Category not found")
    return deleted
  }
}
