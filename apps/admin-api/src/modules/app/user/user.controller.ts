import { Permission } from "@goi/nest-kit"
import { generateSalt, hashPassword } from "@goi/utils-node"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import {
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
  UserListQueryDto,
  UserPageResponseDto,
  UserResponseDto,
} from "./user.dto"
import { UserService } from "./user.service"

@ApiTags("用户")
@Controller("app/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  @Permission("app:user:create")
  @ApiOperation({ summary: "创建用户" })
  @ZodResponse({ type: UserResponseDto })
  async create(@Body() body: CreateUserDto) {
    const salt = generateSalt(16)
    const password = hashPassword(body.password, salt)
    return this.userService.create({ ...body, password, salt, userId: nanoid(32) })
  }

  @Get("find")
  @Permission("app:user:read")
  @ApiOperation({ summary: "查询用户" })
  @ZodResponse({ type: UserResponseDto })
  async find(@Query("userId") userId: string) {
    return this.userService.find(userId)
  }

  @Get("list")
  @Permission("app:user:read")
  @ApiOperation({ summary: "查询用户列表" })
  @ZodResponse({ type: UserPageResponseDto })
  async list(@Query() query: UserListQueryDto) {
    return this.userService.list(query)
  }

  @Post("update")
  @Permission("app:user:update")
  @ApiOperation({ summary: "更新用户" })
  @ZodResponse({ type: UserResponseDto })
  async update(@Body() body: UpdateUserDto) {
    return this.userService.update(body)
  }

  @Post("delete")
  @Permission("app:user:delete")
  @ApiOperation({ summary: "删除用户" })
  async delete(@Body() body: DeleteUserDto) {
    return this.userService.delete(body.userId)
  }
}
