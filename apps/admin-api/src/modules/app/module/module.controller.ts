import { Permission } from "@goi/nest-kit/security"
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
@Controller("app/module")
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post("create")
  @Permission("app:module:create")
  @ApiOperation({ summary: "创建模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async create(@Body() body: CreateModuleDto) {
    return this.moduleService.create({ ...body, moduleId: nanoid(32) })
  }

  @Get("find")
  @Permission("app:module:read")
  @ApiOperation({ summary: "查询模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async find(@Query("moduleId") moduleId: string) {
    return this.moduleService.find(moduleId)
  }

  @Get("list")
  @Permission("app:module:read")
  @ApiOperation({ summary: "查询模块列表" })
  @ZodResponse({ type: ModulePageResponseDto })
  async list(@Query() query: ModuleListQueryDto) {
    return this.moduleService.list(query)
  }

  @Get("all")
  @Permission("app:module:read")
  @ApiOperation({ summary: "查询模块全量列表" })
  @ZodResponse({ type: ModuleListResponseDto })
  async all(@Query() query: ModuleAllQueryDto) {
    return this.moduleService.all(query)
  }

  @Get("roots")
  @Permission("app:module:read")
  @ApiOperation({ summary: "查询根模块列表" })
  @ZodResponse({ type: ModuleListResponseDto })
  async roots() {
    return this.moduleService.roots()
  }

  @Post("update")
  @Permission("app:module:update")
  @ApiOperation({ summary: "更新模块" })
  @ZodResponse({ type: ModuleResponseDto })
  async update(@Body() body: UpdateModuleDto) {
    return this.moduleService.update(body)
  }

  @Post("delete")
  @Permission("app:module:delete")
  @ApiOperation({ summary: "删除模块" })
  async delete(@Body() body: DeleteModuleDto) {
    return this.moduleService.delete(body.moduleId)
  }
}
