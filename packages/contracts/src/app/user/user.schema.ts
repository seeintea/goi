import { z } from "zod"

const shape = {
  userId: z.uuid().describe("用户ID"),
  username: z.string().min(1).max(30).describe("用户名"),
  password: z.string().min(1).max(100).describe("密码明文"),
  salt: z.string().min(1).max(16).describe("盐"),
  email: z.string().max(50).describe("邮箱"),
  phone: z.string().max(11).describe("手机号"),
  isDisabled: z.boolean().describe("是否禁用"),
  isDeleted: z.boolean().describe("是否删除"),
  createdAt: z.iso.datetime().describe("创建时间"),
  updatedAt: z.iso.datetime().describe("更新时间"),
  page: z.coerce.number().int().min(1).describe("页码"),
  pageSize: z.coerce.number().int().min(1).max(100).describe("每页数量"),
} satisfies z.ZodRawShape

export const appUserResponseSchema = z
  .object({
    userId: shape.userId,
    username: shape.username,
    email: shape.email,
    phone: shape.phone,
    isDisabled: shape.isDisabled,
    isDeleted: shape.isDeleted,
    createdAt: shape.createdAt,
    updatedAt: shape.updatedAt,
  })
  .meta({ id: "用户响应类型" })

export const createAppUserSchema = z
  .object({
    username: shape.username,
    password: shape.password,
    email: shape.email.optional(),
    phone: shape.phone.optional(),
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建用户请求" })

export const updateAppUserSchema = z
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

export const deleteAppUserSchema = z
  .object({
    userId: shape.userId,
  })
  .meta({ id: "删除用户请求" })

export const appUserListQuerySchema = z
  .object({
    userId: shape.userId.optional(),
    username: shape.username.optional(),
    isDisabled: z.coerce.boolean().optional(),
    isDeleted: z.coerce.boolean().optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询用户分页列表请求" })

const appUserPageItemSchema = z.object({
  userId: shape.userId,
  username: shape.username,
  email: shape.email,
  phone: shape.phone,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
})

export const appUserPageResponseSchema = z
  .object({
    list: z.array(appUserPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "用户分页响应" })

export type AppUser = z.infer<typeof appUserResponseSchema>
export type CreateAppUser = z.infer<typeof createAppUserSchema>
export type UpdateAppUser = z.infer<typeof updateAppUserSchema>
