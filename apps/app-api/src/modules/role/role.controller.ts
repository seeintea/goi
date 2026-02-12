import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  CreateRoleDto,
  DeleteRoleDto,
  RoleListQueryDto,
  RolePageResponseDto,
  RoleResponseDto,
  UpdateRoleDto,
} from "./role.dto"
import { RoleService } from "./role.service"

@ApiTags("角色")
@Controller("sys/role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post("create")
  @Permission("sys:role:create")
  @ApiOperation({ summary: "创建角色" })
  @ZodResponse({ type: RoleResponseDto })
  async create(@Body() body: CreateRoleDto) {
    return this.roleService.create({ ...body, roleId: uuid() })
  }

  @Get("find")
  @Permission("sys:role:read")
  @ApiOperation({ summary: "查询角色" })
  @ZodResponse({ type: RoleResponseDto })
  async find(@Query("roleId") roleId: string) {
    return this.roleService.find(roleId)
  }

  @Get("list")
  @Permission("sys:role:read")
  @ApiOperation({ summary: "查询角色列表" })
  @ZodResponse({ type: RolePageResponseDto })
  async list(@Query() query: RoleListQueryDto) {
    return this.roleService.list(query)
  }

  @Post("update")
  @Permission("sys:role:update")
  @ApiOperation({ summary: "更新角色" })
  @ZodResponse({ type: RoleResponseDto })
  async update(@Body() body: UpdateRoleDto) {
    return this.roleService.update(body)
  }

  @Post("delete")
  @Permission("sys:role:delete")
  @ApiOperation({ summary: "删除角色" })
  async delete(@Body() body: DeleteRoleDto) {
    return this.roleService.delete(body.roleId)
  }
}
