import { Permission } from "@goi/nest-kit"
import { generateSalt, hashPassword } from "@goi/utils-node"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
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
@Controller("sys/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  @Permission("sys:user:create")
  @ApiOperation({ summary: "创建用户" })
  @ZodResponse({ type: UserResponseDto })
  async create(@Body() body: CreateUserDto) {
    const salt = generateSalt(16)
    const password = hashPassword(body.password, salt)
    return this.userService.create({ ...body, password, salt, userId: uuid() })
  }

  @Get("find")
  @Permission("sys:user:read")
  @ApiOperation({ summary: "查询用户" })
  @ZodResponse({ type: UserResponseDto })
  async find(@Query("userId") userId: string) {
    return this.userService.find(userId)
  }

  @Get("list")
  @Permission("sys:user:read")
  @ApiOperation({ summary: "查询用户列表" })
  @ZodResponse({ type: UserPageResponseDto })
  async list(@Query() query: UserListQueryDto) {
    return this.userService.list(query)
  }

  @Post("update")
  @Permission("sys:user:update")
  @ApiOperation({ summary: "更新用户" })
  @ZodResponse({ type: UserResponseDto })
  async update(@Body() body: UpdateUserDto) {
    if (body.password) {
      const salt = generateSalt(16)
      const password = hashPassword(body.password, salt)
      return this.userService.update({ ...body, password, salt })
    }
    return this.userService.update(body)
  }

  @Post("delete")
  @Permission("sys:user:delete")
  @ApiOperation({ summary: "删除用户" })
  async delete(@Body() body: DeleteUserDto) {
    return this.userService.delete(body.userId)
  }
}
