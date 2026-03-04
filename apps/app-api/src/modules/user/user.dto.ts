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
  updateAppUserSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedUserResponseSchema = appUserResponseSchema as z.ZodType<AppUser>
const typedCreateUserSchema = createAppUserSchema as z.ZodType<CreateAppUser & { familyId?: string }>
const typedUpdateUserSchema = updateAppUserSchema as z.ZodType<UpdateAppUser>
const typedResetUserPasswordSchema = resetAppUserPasswordSchema as z.ZodType<ResetAppUserPassword>
const typedDeleteUserSchema = deleteAppUserSchema as z.ZodType<{ userId: string }>

export class UserResponseDto extends createZodDto(typedUserResponseSchema) {}
export class CreateUserDto extends createZodDto(typedCreateUserSchema) {}
export class UpdateUserDto extends createZodDto(typedUpdateUserSchema) {}
export class ResetUserPasswordDto extends createZodDto(typedResetUserPasswordSchema) {}
export class DeleteUserDto extends createZodDto(typedDeleteUserSchema) {}
export class UserListQueryDto extends createZodDto(appUserListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(appUserPageResponseSchema) {}
