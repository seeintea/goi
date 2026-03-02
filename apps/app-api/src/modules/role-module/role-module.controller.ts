import { Permission } from "@goi/nest-kit"
import { Controller, Get, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { RoleModuleListQueryDto, RoleModulePageResponseDto } from "./role-module.dto"
import { RoleModuleService } from "./role-module.service"

@ApiTags("RoleModule")
@Controller("role-module")
export class RoleModuleController {
  constructor(private readonly service: RoleModuleService) {}

  @Get("list")
  @Permission("app:role-module:read")
  @ApiOperation({ summary: "查询角色模块关联列表" })
  @ZodResponse({ type: RoleModulePageResponseDto })
  async list(@Query() query: RoleModuleListQueryDto) {
    return this.service.list(query)
  }
}
