import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const shape = {
  userId: z.string().length(32).describe("用户ID"),
  username: z.string().min(1).max(30).describe("用户名"),
  password: z.string().min(1).max(100).describe("密码明文"),
  salt: z.string().min(1).max(16).describe("盐"),
  email: z.string().max(50).describe("邮箱"),
  phone: z.string().max(11).describe("手机号"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createTime: z.iso.datetime().describe("创建时间"),
  updateTime: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

const userResponseSchema = z
  .object({
    userId: shape.userId,
    username: shape.username,
    email: shape.email,
    phone: shape.phone,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createTime: shape.createTime,
    updateTime: shape.updateTime,
  })
  .meta({ id: "用户响应类型" })

const createUserSchema = z
  .object({
    username: shape.username,
    password: shape.password,
    email: shape.email.optional(),
    phone: shape.phone.optional(),
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建用户请求" })

const updateUserSchema = z
  .object({
    userId: shape.userId,
    username: shape.username.optional(),
    password: shape.password.optional(),
    salt: shape.salt.optional(),
    email: shape.email.optional(),
    phone: shape.phone.optional(),
    isDisabled: shape.isDisabled.optional(),
    isDeleted: shape.isDeleted.optional(),
  })
  .meta({ id: "更新用户请求" })

const deleteUserSchema = z
  .object({
    userId: shape.userId,
  })
  .meta({ id: "删除用户请求" })

const userListQuerySchema = z
  .object({
    userId: shape.userId.optional(),
    username: shape.username.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询用户分页列表请求" })

const userPageItemSchema = z.object({
  userId: shape.userId,
  username: shape.username,
  email: shape.email,
  phone: shape.phone,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

const userPageResponseSchema = z
  .object({
    list: z.array(userPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "用户分页响应" })

export class UserResponseDto extends createZodDto(userResponseSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class DeleteUserDto extends createZodDto(deleteUserSchema) {}
export class UserListQueryDto extends createZodDto(userListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(userPageResponseSchema) {}

export type User = z.infer<typeof userResponseSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
