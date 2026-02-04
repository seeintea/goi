import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import type { CreateUser, UpdateUser, User } from "./user.dto"
import type { AuthUser, PageResult, UserListQuery, UserRepository } from "./user.repository"
import { USER_REPOSITORY } from "./user.tokens"

@Injectable()
export class UserService {
  @Inject(USER_REPOSITORY)
  private readonly userRepository!: UserRepository

  async find(userId: string): Promise<User> {
    const user = await this.userRepository.find(userId)
    if (!user) throw new NotFoundException("用户不存在")
    return user
  }

  async findAuthUserByUsername(username: string): Promise<AuthUser | undefined> {
    return this.userRepository.findAuthUserByUsername(username)
  }

  async create(values: CreateUser & { userId: string; salt: string; password: string }): Promise<User> {
    return this.userRepository.create(values)
  }

  async update(values: UpdateUser): Promise<User> {
    return this.userRepository.update(values)
  }

  async delete(userId: string): Promise<boolean> {
    return this.userRepository.delete(userId)
  }

  async list(query: UserListQuery): Promise<PageResult<User>> {
    return this.userRepository.list(query)
  }
}
