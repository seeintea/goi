import type { Category, CreateCategory, UpdateCategory } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { financeCategory } = pgSchema

@Injectable()
export class CategoryService {
  constructor(private readonly pg: PgService) {}

  async find(id: string): Promise<Category> {
    const rows = await this.pg.pdb
      .select({
        id: financeCategory.id,
        familyId: financeCategory.familyId,
        name: financeCategory.name,
        type: financeCategory.type,
        parentId: financeCategory.parentId,
        isHidden: financeCategory.isHidden,
        sortOrder: financeCategory.sortOrder,
        icon: financeCategory.icon,
        color: financeCategory.color,
        isDeleted: financeCategory.isDeleted,
        createdAt: financeCategory.createdAt,
        updatedAt: financeCategory.updatedAt,
      })
      .from(financeCategory)
      .where(and(eq(financeCategory.id, id), eq(financeCategory.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Category not found")

    return row as Category
  }

  async create(dto: CreateCategory & { id: string }): Promise<Category> {
    const [inserted] = await this.pg.pdb
      .insert(financeCategory)
      .values({
        id: dto.id,
        familyId: dto.familyId,
        name: dto.name,
        type: dto.type,
        parentId: dto.parentId,
        isHidden: dto.isHidden ?? false,
        sortOrder: dto.sortOrder ?? 0,
        icon: dto.icon,
        color: dto.color,
      })
      .returning({ id: financeCategory.id })

    return this.find(inserted.id)
  }

  async update(dto: UpdateCategory): Promise<Category> {
    await this.pg.pdb
      .update(financeCategory)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.isHidden !== undefined ? { isHidden: dto.isHidden } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
      })
      .where(eq(financeCategory.id, dto.id))

    return this.find(dto.id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeCategory)
      .set({ isDeleted: true })
      .where(eq(financeCategory.id, id))
      .returning({ id: financeCategory.id })

    if (!deleted) throw new NotFoundException("Category not found")
    return true
  }

  async list(query: {
    familyId: string
    name?: string
    type?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Category>> {
    const where: Parameters<typeof and> = [
      eq(financeCategory.familyId, query.familyId),
      eq(financeCategory.isDeleted, false),
    ]

    if (query.name) {
      where.push(ilike(financeCategory.name, `%${query.name}%`))
    }
    if (query.type) {
      where.push(eq(financeCategory.type, query.type))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeCategory)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeCategory.id,
        familyId: financeCategory.familyId,
        name: financeCategory.name,
        type: financeCategory.type,
        parentId: financeCategory.parentId,
        isHidden: financeCategory.isHidden,
        sortOrder: financeCategory.sortOrder,
        icon: financeCategory.icon,
        color: financeCategory.color,
        createdAt: financeCategory.createdAt,
        updatedAt: financeCategory.updatedAt,
      })
      .from(financeCategory)
      .where(and(...where))
      .orderBy(desc(financeCategory.sortOrder), desc(financeCategory.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(pageParams, total, rows as Category[])
  }
}
