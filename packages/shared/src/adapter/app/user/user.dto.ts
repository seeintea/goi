import { createZodDto } from "nestjs-zod"
import {
  createUserSchema,
  deleteUserSchema,
  updateUserSchema,
  userListQuerySchema,
  userPageResponseSchema,
  userResponseSchema,
} from "../../../contracts/app/user"

export class UserResponseDto extends createZodDto(userResponseSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class DeleteUserDto extends createZodDto(deleteUserSchema) {}
export class UserListQueryDto extends createZodDto(userListQuerySchema) {}
export class UserPageResponseDto extends createZodDto(userPageResponseSchema) {}
