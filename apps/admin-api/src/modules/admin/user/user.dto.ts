import type { AdminUser, CreateAdminUser, UpdateAdminUser } from "@goi/contracts/admin/user"
import {
  adminUserListQuerySchema,
  adminUserPageResponseSchema,
  adminUserResponseSchema,
  createAdminUserSchema,
  deleteAdminUserSchema,
  updateAdminUserSchema,
} from "@goi/contracts/admin/user"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAdminUserResponseSchema = adminUserResponseSchema as z.ZodType<AdminUser>
const typedCreateAdminUserSchema = createAdminUserSchema as z.ZodType<CreateAdminUser>
const typedUpdateAdminUserSchema = updateAdminUserSchema as z.ZodType<UpdateAdminUser>
const typedDeleteAdminUserSchema = deleteAdminUserSchema as z.ZodType<{ userId: string }>

export class AdminUserResponseDto extends createZodDto(typedAdminUserResponseSchema) {}
export class CreateAdminUserDto extends createZodDto(typedCreateAdminUserSchema) {}
export class UpdateAdminUserDto extends createZodDto(typedUpdateAdminUserSchema) {}
export class DeleteAdminUserDto extends createZodDto(typedDeleteAdminUserSchema) {}
export class AdminUserListQueryDto extends createZodDto(adminUserListQuerySchema) {}
export class AdminUserPageResponseDto extends createZodDto(adminUserPageResponseSchema) {}
