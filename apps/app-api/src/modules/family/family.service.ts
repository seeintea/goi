import { financeFamily } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { CreateFamilyDto, FamilyListQueryDto, UpdateFamilyDto } from "./family.dto"

@Injectable()
export class FamilyService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(userId: string, dto: CreateFamilyDto) {
    const [created] = await this.db
      .insert(financeFamily)
      .values({
        ...dto,
        ownerUserId: userId,
      })
      .returning()
    return created
  }

  async findAll(query: FamilyListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = []
    if (query.name) {
      conditions.push(ilike(financeFamily.name, `%${query.name}%`))
    }

    const where = conditions.length ? and(...conditions) : undefined

    const [total] = await this.db.select({ count: count() }).from(financeFamily).where(where)
    const items = await this.db
      .select()
      .from(financeFamily)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeFamily.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeFamily).where(eq(financeFamily.id, id))
    if (!item) throw new NotFoundException("Family not found")
    return item
  }

  async update(id: string, dto: UpdateFamilyDto) {
    const [updated] = await this.db.update(financeFamily).set(dto).where(eq(financeFamily.id, id)).returning()
    if (!updated) throw new NotFoundException("Family not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeFamily).where(eq(financeFamily.id, id)).returning()
    if (!deleted) throw new NotFoundException("Family not found")
    return deleted
  }
}
