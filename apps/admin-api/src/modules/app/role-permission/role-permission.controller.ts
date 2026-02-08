import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import {
  CreateRolePermissionDto,
  DeleteRolePermissionDto,
  RolePermissionListQueryDto,
  RolePermissionPageResponseDto,
  RolePermissionResponseDto,
} from "./role-permission.dto"
import { RolePermissionService } from "./role-permission.service"

@ApiTags("角色权限关联")
@Controller("app/role-permission")
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post("create")
  @Permission("app:role-permission:create")
  @ApiOperation({ summary: "创建角色权限关联" })
  @ZodResponse({ type: RolePermissionResponseDto })
  async create(@Body() body: CreateRolePermissionDto) {
    return this.rolePermissionService.create(body)
  }

  @Get("find")
  @Permission("app:role-permission:read")
  @ApiOperation({ summary: "查询角色权限关联" })
  @ZodResponse({ type: RolePermissionResponseDto })
  async find(@Query("roleId") roleId: string, @Query("permissionId") permissionId: string) {
    return this.rolePermissionService.find(roleId, permissionId)
  }

  @Get("list")
  @Permission("app:role-permission:read")
  @ApiOperation({ summary: "查询角色权限关联列表" })
  @ZodResponse({ type: RolePermissionPageResponseDto })
  async list(@Query() query: RolePermissionListQueryDto) {
    return this.rolePermissionService.list(query)
  }

  @Post("delete")
  @Permission("app:role-permission:delete")
  @ApiOperation({ summary: "删除角色权限关联" })
  async delete(@Body() body: DeleteRolePermissionDto) {
    return this.rolePermissionService.delete(body.roleId, body.permissionId)
  }
}
