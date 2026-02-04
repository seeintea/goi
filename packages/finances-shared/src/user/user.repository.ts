import type { CreateUser, UpdateUser, User } from "./user.dto"

export type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type AuthUser = {
  userId: string
  username: string
  password: string
  salt: string
  isDisabled: boolean
  isDeleted: boolean
}

export type CreateUserValues = CreateUser & { userId: string; salt: string; password: string }

export type UpdateUserValues = UpdateUser

export type UserListQuery = {
  userId?: string
  username?: string
  page?: number | string
  pageSize?: number | string
}

export interface UserRepository {
  find(userId: string): Promise<User | undefined>
  findAuthUserByUsername(username: string): Promise<AuthUser | undefined>
  create(values: CreateUserValues): Promise<User>
  update(values: UpdateUserValues): Promise<User>
  delete(userId: string): Promise<boolean>
  list(query: UserListQuery): Promise<PageResult<User>>
}

