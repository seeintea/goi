import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import type { BookMember, CreateBookMember, UpdateBookMember } from "./book-member.dto"

const { financeBookMember: bookMemberSchema } = pgSchema

@Injectable()
export class BookMemberService {
  constructor(private readonly pg: PgService) {}

  async find(bookId: string, memberId: string): Promise<BookMember> {
    const members = await this.pg.pdb
      .select({
        memberId: bookMemberSchema.memberId,
        bookId: bookMemberSchema.bookId,
        userId: bookMemberSchema.userId,
        roleCode: bookMemberSchema.roleCode,
        scopeType: bookMemberSchema.scopeType,
        scope: bookMemberSchema.scope,
        isDeleted: bookMemberSchema.isDeleted,
        createdAt: bookMemberSchema.createdAt,
        updatedAt: bookMemberSchema.updatedAt,
      })
      .from(bookMemberSchema)
      .where(
        and(
          eq(bookMemberSchema.bookId, bookId),
          eq(bookMemberSchema.memberId, memberId),
          eq(bookMemberSchema.isDeleted, false),
        ),
      )
    const member = members[0]
    if (!member) throw new NotFoundException("账本成员不存在")
    return {
      ...member,
      createdAt: toIsoString(member.createdAt),
      updatedAt: toIsoString(member.updatedAt),
    }
  }

  async create(values: CreateBookMember & { memberId: string }): Promise<BookMember> {
    await this.pg.pdb.insert(bookMemberSchema).values({
      memberId: values.memberId,
      bookId: values.bookId,
      userId: values.userId,
      roleCode: values.roleCode,
      scopeType: values.scopeType ?? "all",
      scope: (values.scope ?? {}) as object,
      isDeleted: false,
    })
    return this.find(values.bookId, values.memberId)
  }

  async update(bookId: string, values: UpdateBookMember): Promise<BookMember> {
    await this.pg.pdb
      .update(bookMemberSchema)
      .set({
        ...(values.roleCode !== undefined ? { roleCode: values.roleCode } : {}),
        ...(values.scopeType !== undefined ? { scopeType: values.scopeType } : {}),
        ...(values.scope !== undefined ? { scope: values.scope as object } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(and(eq(bookMemberSchema.bookId, bookId), eq(bookMemberSchema.memberId, values.memberId)))
    return this.find(bookId, values.memberId)
  }

  async delete(bookId: string, memberId: string): Promise<boolean> {
    await this.pg.pdb
      .update(bookMemberSchema)
      .set({ isDeleted: true })
      .where(and(eq(bookMemberSchema.bookId, bookId), eq(bookMemberSchema.memberId, memberId)))
    return true
  }

  async list(
    bookId: string,
    query: {
      userId?: string
      page?: number | string
      pageSize?: number | string
    },
  ): Promise<PageResult<BookMember>> {
    const where: Parameters<typeof and> = [eq(bookMemberSchema.isDeleted, false), eq(bookMemberSchema.bookId, bookId)]
    if (query.userId) where.push(eq(bookMemberSchema.userId, query.userId))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(bookMemberSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        memberId: bookMemberSchema.memberId,
        bookId: bookMemberSchema.bookId,
        userId: bookMemberSchema.userId,
        roleCode: bookMemberSchema.roleCode,
        scopeType: bookMemberSchema.scopeType,
        scope: bookMemberSchema.scope,
        isDeleted: bookMemberSchema.isDeleted,
        createdAt: bookMemberSchema.createdAt,
        updatedAt: bookMemberSchema.updatedAt,
      })
      .from(bookMemberSchema)
      .where(and(...where))
      .orderBy(desc(bookMemberSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
