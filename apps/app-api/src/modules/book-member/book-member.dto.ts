import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  memberId: z.string().length(32).describe("成员关系ID"),
  bookId: z.string().length(32).describe("账本ID"),
  userId: z.string().length(32).describe("用户ID"),
  roleCode: z.string().min(1).max(20).describe("角色编码"),
  scopeType: z.string().min(1).max(20).describe("范围类型"),
  scope: z.unknown().describe("范围明细"),
  isDeleted: z.boolean().describe("是否删除"),
  createTime: z.iso.datetime().describe("创建时间"),
  updateTime: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const bookMemberResponseSchema = z
  .object({
    memberId: shape.memberId,
    bookId: shape.bookId,
    userId: shape.userId,
    roleCode: shape.roleCode,
    scopeType: shape.scopeType,
    scope: shape.scope,
    isDeleted: shape.isDeleted,
    createTime: shape.createTime,
    updateTime: shape.updateTime,
  })
  .meta({ id: "账本成员响应类型" })

const createBookMemberSchema = z
  .object({
    bookId: shape.bookId,
    userId: shape.userId,
    roleCode: shape.roleCode,
    scopeType: shape.scopeType.optional(),
    scope: shape.scope.optional(),
  })
  .meta({ id: "创建账本成员请求" })

const updateBookMemberSchema = z
  .object({
    memberId: shape.memberId,
    roleCode: shape.roleCode.optional(),
    scopeType: shape.scopeType.optional(),
    scope: shape.scope.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新账本成员请求" })

const deleteBookMemberSchema = z
  .object({
    memberId: shape.memberId,
  })
  .meta({ id: "删除账本成员请求" })

const bookMemberListQuerySchema = z
  .object({
    bookId: shape.bookId.optional(),
    userId: shape.userId.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询账本成员分页列表请求" })

const bookMemberPageItemSchema = z.object({
  memberId: shape.memberId,
  bookId: shape.bookId,
  userId: shape.userId,
  roleCode: shape.roleCode,
  scopeType: shape.scopeType,
  scope: shape.scope,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

const bookMemberPageResponseSchema = z
  .object({
    list: z.array(bookMemberPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "账本成员分页响应" })

export class BookMemberResponseDto extends createZodDto(bookMemberResponseSchema) {}
export class CreateBookMemberDto extends createZodDto(createBookMemberSchema) {}
export class UpdateBookMemberDto extends createZodDto(updateBookMemberSchema) {}
export class DeleteBookMemberDto extends createZodDto(deleteBookMemberSchema) {}
export class BookMemberListQueryDto extends createZodDto(bookMemberListQuerySchema) {}
export class BookMemberPageResponseDto extends createZodDto(bookMemberPageResponseSchema) {}

export type BookMember = z.infer<typeof bookMemberResponseSchema>
export type CreateBookMember = z.infer<typeof createBookMemberSchema>
export type UpdateBookMember = z.infer<typeof updateBookMemberSchema>
