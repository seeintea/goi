import {
  AppUser,
  appUserListQuerySchema,
  appUserPageResponseSchema,
  appUserResponseSchema,
  CreateAppUser,
  createAppUserSchema,
  deleteAppUserSchema,
  ResetAppUserPassword,
  resetAppUserPasswordSchema,
  UpdateAppUser,
  UpdateAppUserStatus,
  updateAppUserSchema,
  updateAppUserStatusSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedUserResponseSchema = appUserResponseSchema as z.ZodType<AppUser>
const typedCreateUserSchema = createAppUserSchema as z.ZodType<CreateAppUser>
const typedUpdateUserSchema = updateAppUserSchema as z.ZodType<UpdateAppUser>
const typedDeleteUserSchema = deleteAppUserSchema as z.ZodType<{ userId: string }>
const typedResetPasswordSchema = resetAppUserPasswordSchema as z.ZodType<ResetAppUserPassword>
const typedUpdateStatusSchema = updateAppUserStatusSchema as z.ZodType<UpdateAppUserStatus>

export class UserResponseDto extends createZodDto(typedUserResponseSchema) {}
export class CreateUserDto extends createZodDto(typedCreateUserSchema) {}
export class UpdateUserDto extends createZodDto(typedUpdateUserSchema) {}
export class DeleteUserDto extends createZodDto(typedDeleteUserSchema) {}
export class ResetPasswordDto extends createZodDto(typedResetPasswordSchema) {}
export class UpdateStatusDto extends createZodDto(typedUpdateStatusSchema) {}
export class UserListQueryDto extends createZodDto(appUserListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(appUserPageResponseSchema) {}
