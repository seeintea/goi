import {
  AdminUser,
  adminUserListQuerySchema,
  adminUserPageResponseSchema,
  adminUserResponseSchema,
  CreateAdminUser,
  createAdminUserSchema,
  deleteAdminUserSchema,
  UpdateAdminUser,
  updateAdminUserSchema,
  UpdateAdminUserStatus,
  updateAdminUserStatusSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAdminUserResponseSchema = adminUserResponseSchema as z.ZodType<AdminUser>
const typedCreateAdminUserSchema = createAdminUserSchema as z.ZodType<CreateAdminUser>
const typedUpdateAdminUserSchema = updateAdminUserSchema as z.ZodType<UpdateAdminUser>
const typedDeleteAdminUserSchema = deleteAdminUserSchema as z.ZodType<{ userId: string }>
const typedUpdateStatusSchema = updateAdminUserStatusSchema as z.ZodType<UpdateAdminUserStatus>

export class AdminUserResponseDto extends createZodDto(typedAdminUserResponseSchema) {}
export class CreateAdminUserDto extends createZodDto(typedCreateAdminUserSchema) {}
export class UpdateAdminUserDto extends createZodDto(typedUpdateAdminUserSchema) {}
export class DeleteAdminUserDto extends createZodDto(typedDeleteAdminUserSchema) {}
export class UpdateStatusDto extends createZodDto(typedUpdateStatusSchema) {}
export class AdminUserListQueryDto extends createZodDto(adminUserListQuerySchema) {}
export class AdminUserPageResponseDto extends createZodDto(adminUserPageResponseSchema) {}
