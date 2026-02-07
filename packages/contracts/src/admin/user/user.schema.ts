import { z } from "zod"

const shape = {
  userId: z.string().length(32).describe("管理员用户ID"),
  username: z.string().min(1).max(30).describe("管理员用户名"),
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

export const adminUserResponseSchema = z
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
  .meta({ id: "管理员用户响应类型" })

export const createAdminUserSchema = z
  .object({
    username: shape.username,
    password: shape.password,
    email: shape.email.optional(),
    phone: shape.phone.optional(),
    isDisabled: shape.isDisabled.optional(),
  })
  .meta({ id: "创建管理员用户请求" })

export const updateAdminUserSchema = z
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
  .meta({ id: "更新管理员用户请求" })

export const deleteAdminUserSchema = z
  .object({
    userId: shape.userId,
  })
  .meta({ id: "删除管理员用户请求" })

export const adminUserListQuerySchema = z
  .object({
    userId: shape.userId.optional(),
    username: shape.username.optional(),
    page: shape.page.optional(),
    pageSize: shape.pageSize.optional(),
  })
  .meta({ id: "查询管理员用户分页列表请求" })

const adminUserPageItemSchema = z.object({
  userId: shape.userId,
  username: shape.username,
  email: shape.email,
  phone: shape.phone,
  isDisabled: shape.isDisabled,
  isDeleted: shape.isDeleted,
  createTime: shape.createTime,
  updateTime: shape.updateTime,
})

export const adminUserPageResponseSchema = z
  .object({
    list: z.array(adminUserPageItemSchema),
    total: z.number().int().min(0),
    page: shape.page,
    pageSize: shape.pageSize,
  })
  .meta({ id: "管理员用户分页响应" })

export type AdminUser = z.infer<typeof adminUserResponseSchema>
export type CreateAdminUser = z.infer<typeof createAdminUserSchema>
export type UpdateAdminUser = z.infer<typeof updateAdminUserSchema>
