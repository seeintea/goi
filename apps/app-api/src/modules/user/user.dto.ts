import type { CreateUser, UpdateUser, User } from "@goi/contracts/app/user"
import {
  createUserSchema,
  deleteUserSchema,
  updateUserSchema,
  userListQuerySchema,
  userPageResponseSchema,
  userResponseSchema,
} from "@goi/contracts/app/user"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedUserResponseSchema = userResponseSchema as z.ZodType<User>
const typedCreateUserSchema = createUserSchema as z.ZodType<CreateUser>
const typedUpdateUserSchema = updateUserSchema as z.ZodType<UpdateUser>
const typedDeleteUserSchema = deleteUserSchema as z.ZodType<{ userId: string }>

export class UserResponseDto extends createZodDto(typedUserResponseSchema) {}
export class CreateUserDto extends createZodDto(typedCreateUserSchema) {}
export class UpdateUserDto extends createZodDto(typedUpdateUserSchema) {}
export class DeleteUserDto extends createZodDto(typedDeleteUserSchema) {}
export class UserListQueryDto extends createZodDto(userListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(userPageResponseSchema) {}
