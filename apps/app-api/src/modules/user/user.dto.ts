import type { AppUser, CreateAppUser, UpdateAppUser } from "@goi/contracts/app/user"
import {
  appUserListQuerySchema,
  appUserPageResponseSchema,
  appUserResponseSchema,
  createAppUserSchema,
  deleteAppUserSchema,
  updateAppUserSchema,
} from "@goi/contracts/app/user"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedUserResponseSchema = appUserResponseSchema as z.ZodType<AppUser>
const typedCreateUserSchema = createAppUserSchema as z.ZodType<CreateAppUser>
const typedUpdateUserSchema = updateAppUserSchema as z.ZodType<UpdateAppUser>
const typedDeleteUserSchema = deleteAppUserSchema as z.ZodType<{ userId: string }>

export class UserResponseDto extends createZodDto(typedUserResponseSchema) {}
export class CreateUserDto extends createZodDto(typedCreateUserSchema) {}
export class UpdateUserDto extends createZodDto(typedUpdateUserSchema) {}
export class DeleteUserDto extends createZodDto(typedDeleteUserSchema) {}
export class UserListQueryDto extends createZodDto(appUserListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(appUserPageResponseSchema) {}
