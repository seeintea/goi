import { financeFamilyMember } from "@goi/infra"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { and, count, desc, eq } from "drizzle-orm"
import type { DbType } from "@/database/postgresql"
import { DATABASE_CONNECTION } from "@/database/postgresql"
import { CreateFamilyMemberDto, FamilyMemberListQueryDto, UpdateFamilyMemberDto } from "./family-member.dto"

@Injectable()
export class FamilyMemberService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DbType) {}

  async create(dto: CreateFamilyMemberDto) {
    const [created] = await this.db.insert(financeFamilyMember).values(dto).returning()
    return created
  }

  async findAll(query: FamilyMemberListQueryDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const offset = (page - 1) * pageSize

    const conditions = [eq(financeFamilyMember.familyId, query.familyId)]
    if (query.roleId) {
      conditions.push(eq(financeFamilyMember.roleId, query.roleId))
    }

    const where = and(...conditions)

    const [total] = await this.db.select({ count: count() }).from(financeFamilyMember).where(where)
    const items = await this.db
      .select()
      .from(financeFamilyMember)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(financeFamilyMember.joinedAt))

    return {
      items,
      total: Number(total.count),
      page,
      pageSize,
    }
  }

  async findOne(id: string) {
    const [item] = await this.db.select().from(financeFamilyMember).where(eq(financeFamilyMember.id, id))
    if (!item) throw new NotFoundException("FamilyMember not found")
    return item
  }

  async update(id: string, dto: UpdateFamilyMemberDto) {
    const [updated] = await this.db
      .update(financeFamilyMember)
      .set(dto)
      .where(eq(financeFamilyMember.id, id))
      .returning()
    if (!updated) throw new NotFoundException("FamilyMember not found")
    return updated
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(financeFamilyMember).where(eq(financeFamilyMember.id, id)).returning()
    if (!deleted) throw new NotFoundException("FamilyMember not found")
    return deleted
  }
}
