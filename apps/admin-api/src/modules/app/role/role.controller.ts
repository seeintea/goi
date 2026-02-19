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
  UpdateRolePermissionsDto,
  UpdateRoleStatusDto,
} from "./role.dto"
import { RoleService } from "./role.service"

@ApiTags("角色")
@Controller("app/role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get("permissions")
  @Permission("app:role:read")
  @ApiOperation({ summary: "查询角色权限列表" })
  async getPermissions(@Query("roleId") roleId: string) {
    return this.roleService.getPermissions(roleId)
  }

  @Post("updatePermissions")
  @Permission("app:role:update")
  @ApiOperation({ summary: "更新角色权限" })
  async updatePermissions(@Body() body: UpdateRolePermissionsDto) {
    return this.roleService.updatePermissions(body)
  }

  @Post("create")
  @Permission("app:role:create")
  @ApiOperation({ summary: "创建角色" })
  @ZodResponse({ type: RoleResponseDto })
  async create(@Body() body: CreateRoleDto) {
    return this.roleService.create({ ...body, roleId: uuid() })
  }

  @Get("find")
  @Permission("app:role:read")
  @ApiOperation({ summary: "查询角色" })
  @ZodResponse({ type: RoleResponseDto })
  async find(@Query("roleId") roleId: string) {
    return this.roleService.find(roleId)
  }

  @Get("list")
  @Permission("app:role:read")
  @ApiOperation({ summary: "查询角色列表" })
  @ZodResponse({ type: RolePageResponseDto })
  async list(@Query() query: RoleListQueryDto) {
    return this.roleService.list({
      ...query,
      familyId: query.familyId ?? undefined,
      userId: query.userId ?? undefined,
      username: query.username ?? undefined,
      isDeleted: query.isDeleted ?? undefined,
    })
  }

  @Post("update")
  @Permission("app:role:update")
  @ApiOperation({ summary: "更新角色" })
  @ZodResponse({ type: RoleResponseDto })
  async update(@Body() body: UpdateRoleDto) {
    return this.roleService.update(body)
  }

  @Post("updateStatus")
  @Permission("app:role:update")
  @ApiOperation({ summary: "更新角色状态" })
  @ZodResponse({ type: RoleResponseDto })
  async updateStatus(@Body() body: UpdateRoleStatusDto) {
    return this.roleService.updateStatus(body)
  }

  @Post("delete")
  @Permission("app:role:delete")
  @ApiOperation({ summary: "删除角色" })
  async delete(@Body() body: DeleteRoleDto) {
    return this.roleService.delete(body.roleId)
  }
}
