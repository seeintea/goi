import { Permission } from "@goi/nest-kit/security"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import {
  AdminPermissionListQueryDto,
  AdminPermissionPageResponseDto,
  AdminPermissionResponseDto,
  CreateAdminPermissionDto,
  DeleteAdminPermissionDto,
  UpdateAdminPermissionDto,
} from "./admin-permission.dto"
import { AdminPermissionService } from "./admin-permission.service"

@ApiTags("管理员权限")
@Controller("admin/sys/permission")
export class AdminPermissionController {
  constructor(private readonly adminPermissionService: AdminPermissionService) {}

  @Post("create")
  @Permission("admin:permission:create")
  @ApiOperation({ summary: "创建管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async create(@Body() body: CreateAdminPermissionDto) {
    return this.adminPermissionService.create({ ...body, permissionId: nanoid(32) })
  }

  @Get("find")
  @Permission("admin:permission:read")
  @ApiOperation({ summary: "查询管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async find(@Query("permissionId") permissionId: string) {
    return this.adminPermissionService.find(permissionId)
  }

  @Get("list")
  @Permission("admin:permission:read")
  @ApiOperation({ summary: "查询管理员权限列表" })
  @ZodResponse({ type: AdminPermissionPageResponseDto })
  async list(@Query() query: AdminPermissionListQueryDto) {
    return this.adminPermissionService.list(query)
  }

  @Post("update")
  @Permission("admin:permission:update")
  @ApiOperation({ summary: "更新管理员权限" })
  @ZodResponse({ type: AdminPermissionResponseDto })
  async update(@Body() body: UpdateAdminPermissionDto) {
    return this.adminPermissionService.update(body)
  }

  @Post("delete")
  @Permission("admin:permission:delete")
  @ApiOperation({ summary: "删除管理员权限" })
  async delete(@Body() body: DeleteAdminPermissionDto) {
    return this.adminPermissionService.delete(body.permissionId)
  }
}
