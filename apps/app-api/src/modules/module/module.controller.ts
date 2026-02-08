import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import {
  CreateModuleDto,
  DeleteModuleDto,
  ModuleAllQueryDto,
  ModuleListQueryDto,
  ModuleListResponseDto,
  ModulePageResponseDto,
  ModuleResponseDto,
  UpdateModuleDto,
} from "./module.dto"
import { ModuleService } from "./module.service"

@ApiTags("模块")
@Controller("sys/module")
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post("create")
  @Permission("sys:module:create")
  @ApiOperation({ summary: "创建模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async create(@Body() body: CreateModuleDto) {
    return this.moduleService.create({ ...body, moduleId: nanoid(32) })
  }

  @Get("find")
  @Permission("sys:module:read")
  @ApiOperation({ summary: "查询模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async find(@Query("moduleId") moduleId: string) {
    return this.moduleService.find(moduleId)
  }

  @Get("list")
  @Permission("sys:module:read")
  @ApiOperation({ summary: "查询模块列表" })
  @ZodResponse({ type: ModulePageResponseDto })
  async list(@Query() query: ModuleListQueryDto) {
    return this.moduleService.list(query)
  }

  @Get("all")
  @Permission("sys:module:read")
  @ApiOperation({ summary: "查询模块全量列表" })
  @ZodResponse({ type: ModuleListResponseDto })
  async all(@Query() query: ModuleAllQueryDto) {
    return this.moduleService.all(query)
  }

  @Get("roots")
  @Permission("sys:module:read")
  @ApiOperation({ summary: "查询根模块列表" })
  @ZodResponse({ type: ModuleListResponseDto })
  async roots() {
    return this.moduleService.roots()
  }

  @Post("update")
  @Permission("sys:module:update")
  @ApiOperation({ summary: "更新模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async update(@Body() body: UpdateModuleDto) {
    return this.moduleService.update(body)
  }

  @Post("delete")
  @Permission("sys:module:delete")
  @ApiOperation({ summary: "删除模块" })
  async delete(@Body() body: DeleteModuleDto) {
    return this.moduleService.delete(body.moduleId)
  }
}
