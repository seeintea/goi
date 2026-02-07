import { Permission } from "@goi/nest-kit/security"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import {
  AdminModuleAllQueryDto,
  AdminModuleListQueryDto,
  AdminModuleListResponseDto,
  AdminModulePageResponseDto,
  AdminModuleResponseDto,
  CreateAdminModuleDto,
  DeleteAdminModuleDto,
  UpdateAdminModuleDto,
} from "./module.dto"
import { ModuleService } from "./module.service"

@ApiTags("管理员模块")
@Controller("admin/module")
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post("create")
  @Permission("admin:module:create")
  @ApiOperation({ summary: "创建管理员模块" })
  @ZodResponse({ type: AdminModuleResponseDto })
  async create(@Body() body: CreateAdminModuleDto) {
    return this.moduleService.create({ ...body, moduleId: nanoid(32) })
  }

  @Get("find")
  @Permission("admin:module:read")
  @ApiOperation({ summary: "查询管理员模块" })
  @ZodResponse({ type: AdminModuleResponseDto })
  async find(@Query("moduleId") moduleId: string) {
    return this.moduleService.find(moduleId)
  }

  @Get("list")
  @Permission("admin:module:read")
  @ApiOperation({ summary: "查询管理员模块列表" })
  @ZodResponse({ type: AdminModulePageResponseDto })
  async list(@Query() query: AdminModuleListQueryDto) {
    return this.moduleService.list(query)
  }

  @Get("all")
  @Permission("admin:module:read")
  @ApiOperation({ summary: "查询管理员模块全量列表" })
  @ZodResponse({ type: AdminModuleListResponseDto })
  async all(@Query() query: AdminModuleAllQueryDto) {
    return this.moduleService.all(query)
  }

  @Get("roots")
  @Permission("admin:module:read")
  @ApiOperation({ summary: "查询管理员根模块列表" })
  @ZodResponse({ type: AdminModuleListResponseDto })
  async roots() {
    return this.moduleService.roots()
  }

  @Post("update")
  @Permission("admin:module:update")
  @ApiOperation({ summary: "更新管理员模块" })
  @ZodResponse({ type: AdminModuleResponseDto })
  async update(@Body() body: UpdateAdminModuleDto) {
    return this.moduleService.update(body)
  }

  @Post("delete")
  @Permission("admin:module:delete")
  @ApiOperation({ summary: "删除管理员模块" })
  async delete(@Body() body: DeleteAdminModuleDto) {
    return this.moduleService.delete(body.moduleId)
  }
}
