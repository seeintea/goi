import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  bookId: z.string().length(32).describe("账本ID"),
  name: z.string().min(1).max(50).describe("账本名称"),
  currency: z.string().min(1).max(10).describe("币种"),
  timezone: z.string().min(1).max(50).describe("时区"),
  ownerUserId: z.string().length(32).describe("所有者用户ID"),
  isDeleted: z.boolean().describe("是否删除"),
  createdAt: z.iso.datetime().describe("创建时间"),
  updatedAt: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const bookResponseSchema = z
  .object({
    bookId: shape.bookId,
    name: shape.name,
    currency: shape.currency,
    timezone: shape.timezone,
    ownerUserId: shape.ownerUserId,
    isDeleted: shape.isDeleted,
    createdAt: shape.createdAt,
    updatedAt: shape.updatedAt,
  })
  .meta({ id: "账本响应类型" })

const createBookSchema = z
  .object({
    name: shape.name,
    currency: shape.currency.optional(),
    timezone: shape.timezone.optional(),
    ownerUserId: shape.ownerUserId,
  })
  .meta({ id: "创建账本请求" })

const updateBookSchema = z
  .object({
    bookId: shape.bookId,
    name: shape.name.optional(),
    currency: shape.currency.optional(),
    timezone: shape.timezone.optional(),
    ownerUserId: shape.ownerUserId.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新账本请求" })

const deleteBookSchema = z
  .object({
    bookId: shape.bookId,
  })
  .meta({ id: "删除账本请求" })

const bookListQuerySchema = z
  .object({
    ownerUserId: shape.ownerUserId.optional(),
    name: shape.name.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询账本分页列表请求" })

const bookPageItemSchema = z.object({
  bookId: shape.bookId,
  name: shape.name,
  currency: shape.currency,
  timezone: shape.timezone,
  ownerUserId: shape.ownerUserId,
  isDeleted: shape.isDeleted,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
})

const bookPageResponseSchema = z
  .object({
    list: z.array(bookPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "账本分页响应" })

export class BookResponseDto extends createZodDto(bookResponseSchema) {}
export class CreateBookDto extends createZodDto(createBookSchema) {}
export class UpdateBookDto extends createZodDto(updateBookSchema) {}
export class DeleteBookDto extends createZodDto(deleteBookSchema) {}
export class BookListQueryDto extends createZodDto(bookListQuerySchema) {}
export class BookPageResponseDto extends createZodDto(bookPageResponseSchema) {}

export type Book = z.infer<typeof bookResponseSchema>
export type CreateBook = z.infer<typeof createBookSchema>
export type UpdateBook = z.infer<typeof updateBookSchema>
