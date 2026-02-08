import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import { generateSalt, hashPassword } from "@/common/utils/password"
import {
  AdminUserListQueryDto,
  AdminUserPageResponseDto,
  AdminUserResponseDto,
  CreateAdminUserDto,
  DeleteAdminUserDto,
  UpdateAdminUserDto,
} from "./user.dto"
import { UserService } from "./user.service"

@ApiTags("管理员用户")
@Controller("admin/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  @Permission("admin:user:create")
  @ApiOperation({ summary: "创建管理员用户" })
  @ZodResponse({ type: AdminUserResponseDto })
  async create(@Body() body: CreateAdminUserDto) {
    const salt = generateSalt(16)
    const password = hashPassword(body.password, salt)
    return this.userService.create({ ...body, password, salt, userId: nanoid(32) })
  }

  @Get("find")
  @Permission("admin:user:read")
  @ApiOperation({ summary: "查询管理员用户" })
  @ZodResponse({ type: AdminUserResponseDto })
  async find(@Query("userId") userId: string) {
    return this.userService.find(userId)
  }

  @Get("list")
  @Permission("admin:user:read")
  @ApiOperation({ summary: "查询管理员用户列表" })
  @ZodResponse({ type: AdminUserPageResponseDto })
  async list(@Query() query: AdminUserListQueryDto) {
    return this.userService.list(query)
  }

  @Post("update")
  @Permission("admin:user:update")
  @ApiOperation({ summary: "更新管理员用户" })
  @ZodResponse({ type: AdminUserResponseDto })
  async update(@Body() body: UpdateAdminUserDto) {
    return this.userService.update(body)
  }

  @Post("delete")
  @Permission("admin:user:delete")
  @ApiOperation({ summary: "删除管理员用户" })
  async delete(@Body() body: DeleteAdminUserDto) {
    return this.userService.delete(body.userId)
  }
}
