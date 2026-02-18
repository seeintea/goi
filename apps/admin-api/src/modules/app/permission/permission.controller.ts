import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  AppPermissionTreeResponseDto,
  CreatePermissionDto,
  DeletePermissionDto,
  PermissionListQueryDto,
  PermissionPageResponseDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from "./permission.dto"
import { PermissionService } from "./permission.service"

@ApiTags("权限")
@Controller("app/permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get("tree")
  @Permission("app:permission:read")
  @ApiOperation({ summary: "查询权限树" })
  @ZodResponse({ type: AppPermissionTreeResponseDto })
  async tree() {
    return this.permissionService.tree()
  }

  @Post("create")
  @Permission("app:permission:create")
  @ApiOperation({ summary: "创建权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async create(@Body() body: CreatePermissionDto) {
    return this.permissionService.create({ ...body, permissionId: uuid() })
  }

  @Get("find")
  @Permission("app:permission:read")
  @ApiOperation({ summary: "查询权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async find(@Query("permissionId") permissionId: string) {
    return this.permissionService.find(permissionId)
  }

  @Get("list")
  @Permission("app:permission:read")
  @ApiOperation({ summary: "查询权限列表" })
  @ZodResponse({ type: PermissionPageResponseDto })
  async list(@Query() query: PermissionListQueryDto) {
    return this.permissionService.list(query)
  }

  @Post("update")
  @Permission("app:permission:update")
  @ApiOperation({ summary: "更新权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async update(@Body() body: UpdatePermissionDto) {
    return this.permissionService.update(body)
  }

  @Post("delete")
  @Permission("app:permission:delete")
  @ApiOperation({ summary: "删除权限" })
  async delete(@Body() body: DeletePermissionDto) {
    return this.permissionService.delete(body.permissionId)
  }
}
