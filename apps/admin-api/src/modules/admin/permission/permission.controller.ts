import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  AdminPermissionListQueryDto,
  AdminPermissionPageResponseDto,
  AdminPermissionResponseDto,
  CreateAdminPermissionDto,
  DeleteAdminPermissionDto,
  UpdateAdminPermissionDto,
} from "./permission.dto"
import { PermissionService } from "./permission.service"

@ApiTags("管理员权限")
@Controller("admin/permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post("create")
  @Permission("admin:permission:create")
  @ApiOperation({ summary: "创建管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async create(@Body() body: CreateAdminPermissionDto) {
    return this.permissionService.create({ ...body, permissionId: uuid() })
  }

  @Get("find")
  @Permission("admin:permission:read")
  @ApiOperation({ summary: "查询管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async find(@Query("permissionId") permissionId: string) {
    return this.permissionService.find(permissionId)
  }

  @Get("list")
  @Permission("admin:permission:read")
  @ApiOperation({ summary: "查询管理员权限列表" })
  @ZodResponse({ type: AdminPermissionPageResponseDto })
  async list(@Query() query: AdminPermissionListQueryDto) {
    return this.permissionService.list(query)
  }

  @Post("update")
  @Permission("admin:permission:update")
  @ApiOperation({ summary: "更新管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async update(@Body() body: UpdateAdminPermissionDto) {
    return this.permissionService.update(body)
  }

  @Post("delete")
  @Permission("admin:permission:delete")
  @ApiOperation({ summary: "删除管理员权限" })
  async delete(@Body() body: DeleteAdminPermissionDto) {
    return this.permissionService.delete(body.permissionId)
  }
}
