import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, isNotNull, like, or, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import type { Book, CreateBook, UpdateBook } from "./book.dto"

const { financeBook: bookSchema, financeBookMember: bookMemberSchema } = pgSchema

@Injectable()
export class BookService {
  constructor(private readonly pg: PgService) {}

  async find(bookId: string, userId: string): Promise<Book> {
    const books = await this.pg.pdb
      .select({
        bookId: bookSchema.bookId,
        name: bookSchema.name,
        currency: bookSchema.currency,
        timezone: bookSchema.timezone,
        ownerUserId: bookSchema.ownerUserId,
        isDeleted: bookSchema.isDeleted,
        createTime: bookSchema.createTime,
        updateTime: bookSchema.updateTime,
      })
      .from(bookSchema)
      .where(and(eq(bookSchema.bookId, bookId), eq(bookSchema.isDeleted, false)))
    const book = books[0]
    if (!book) throw new NotFoundException("账本不存在")
    if (book.ownerUserId !== userId) {
      const rows = await this.pg.pdb
        .select({ userId: bookMemberSchema.userId })
        .from(bookMemberSchema)
        .where(
          and(
            eq(bookMemberSchema.bookId, bookId),
            eq(bookMemberSchema.userId, userId),
            eq(bookMemberSchema.isDeleted, false),
          ),
        )
        .limit(1)
      if (!rows[0]) throw new ForbiddenException("No access to this book")
    }
    return {
      ...book,
      createTime: toIsoString(book.createTime),
      updateTime: toIsoString(book.updateTime),
    }
  }

  async create(values: CreateBook & { bookId: string }): Promise<Book> {
    await this.pg.pdb.insert(bookSchema).values({
      bookId: values.bookId,
      name: values.name,
      currency: values.currency ?? "CNY",
      timezone: values.timezone ?? "Asia/Shanghai",
      ownerUserId: values.ownerUserId,
      isDeleted: false,
    })
    await this.pg.pdb.insert(bookMemberSchema).values({
      memberId: nanoid(32),
      bookId: values.bookId,
      userId: values.ownerUserId,
      roleCode: "Owner",
      scopeType: "all",
      scope: {} as object,
      isDeleted: false,
    })
    return this.find(values.bookId, values.ownerUserId)
  }

  async update(values: UpdateBook, userId: string): Promise<Book> {
    await this.find(values.bookId, userId)
    await this.pg.pdb
      .update(bookSchema)
      .set({
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.currency !== undefined ? { currency: values.currency } : {}),
        ...(values.timezone !== undefined ? { timezone: values.timezone } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(bookSchema.bookId, values.bookId))
    return this.find(values.bookId, userId)
  }

  async delete(bookId: string, userId: string): Promise<boolean> {
    await this.find(bookId, userId)
    await this.pg.pdb.update(bookSchema).set({ isDeleted: true }).where(eq(bookSchema.bookId, bookId))
    return true
  }

  async list(
    query: {
      ownerUserId?: string
      name?: string
      page?: number | string
      pageSize?: number | string
    },
    userId: string,
  ): Promise<PageResult<Book>> {
    const where: Parameters<typeof and> = [
      eq(bookSchema.isDeleted, false),
      or(eq(bookSchema.ownerUserId, userId), isNotNull(bookMemberSchema.memberId)),
    ]
    if (query.name) where.push(like(bookSchema.name, `%${query.name}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(distinct ${bookSchema.bookId})` })
      .from(bookSchema)
      .leftJoin(
        bookMemberSchema,
        and(
          eq(bookMemberSchema.bookId, bookSchema.bookId),
          eq(bookMemberSchema.userId, userId),
          eq(bookMemberSchema.isDeleted, false),
        ),
      )
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        bookId: bookSchema.bookId,
        name: bookSchema.name,
        currency: bookSchema.currency,
        timezone: bookSchema.timezone,
        ownerUserId: bookSchema.ownerUserId,
        isDeleted: bookSchema.isDeleted,
        createTime: bookSchema.createTime,
        updateTime: bookSchema.updateTime,
      })
      .from(bookSchema)
      .leftJoin(
        bookMemberSchema,
        and(
          eq(bookMemberSchema.bookId, bookSchema.bookId),
          eq(bookMemberSchema.userId, userId),
          eq(bookMemberSchema.isDeleted, false),
        ),
      )
      .where(and(...where))
      .orderBy(desc(bookSchema.createTime))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }))

    return toPageResult(pageParams, total, list)
  }
}
