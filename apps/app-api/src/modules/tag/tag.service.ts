import { financeTag } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { CreateTagDto, TagListQueryDto, UpdateTagDto } from "./tag.dto"

@Injectable()
export class TagService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateTagDto) {
    const [created] = await this.db.insert(financeTag).values(dto).returning()
    return created
  }

  async findAll(query: TagListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeTag.familyId, query.familyId)]
    if (query.name) {
      conditions.push(ilike(financeTag.name, `%${query.name}%`))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeTag).where(where)
    const items = await this.db
      .select()
      .from(financeTag)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeTag.createdAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeTag).where(eq(financeTag.id, id))
    if (!item) throw new NotFoundException("Tag not found")
    return item
  }

  async update(id: string, dto: UpdateTagDto) {
    const [updated] = await this.db.update(financeTag).set(dto).where(eq(financeTag.id, id)).returning()
    if (!updated) throw new NotFoundException("Tag not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeTag).where(eq(financeTag.id, id)).returning()
    if (!deleted) throw new NotFoundException("Tag not found")
    return deleted
  }
}
