import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import { Permission } from "@goi/nest-kit/security"
import {
  CreatePermissionDto,
  DeletePermissionDto,
  PermissionListQueryDto,
  PermissionPageResponseDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from "./permission.dto"
import { PermissionService } from "./permission.service"

@ApiTags("权限")
@Controller("sys/permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post("create")
  @Permission("sys:permission:create")
  @ApiOperation({ summary: "创建权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async create(@Body() body: CreatePermissionDto) {
    return this.permissionService.create({ ...body, permissionId: nanoid(32) })
  }

  @Get("find")
  @Permission("sys:permission:read")
  @ApiOperation({ summary: "查询权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async find(@Query("permissionId") permissionId: string) {
    return this.permissionService.find(permissionId)
  }

  @Get("list")
  @Permission("sys:permission:read")
  @ApiOperation({ summary: "查询权限列表" })
  @ZodResponse({ type: PermissionPageResponseDto })
  async list(@Query() query: PermissionListQueryDto) {
    return this.permissionService.list(query)
  }

  @Post("update")
  @Permission("sys:permission:update")
  @ApiOperation({ summary: "更新权限" })
  @ZodResponse({ type: PermissionResponseDto })
  async update(@Body() body: UpdatePermissionDto) {
    return this.permissionService.update(body)
  }

  @Post("delete")
  @Permission("sys:permission:delete")
  @ApiOperation({ summary: "删除权限" })
  async delete(@Body() body: DeletePermissionDto) {
    return this.permissionService.delete(body.permissionId)
  }
}
