import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import { CurrentUser } from "@/common/decorators/current-user.decorator"
import type { UserPayload } from "@/common/interfaces/user-payload.interface"
import {
  CreateFamilyDto,
  DeleteFamilyDto,
  FamilyListQueryDto,
  FamilyPageResponseDto,
  FamilyResponseDto,
  UpdateFamilyDto,
} from "./family.dto"
import { FamilyService } from "./family.service"

@ApiTags("家庭管理")
@Controller("families")
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post("create")
  @Permission("fin:family:create")
  @ApiOperation({ summary: "创建家庭" })
  @ZodResponse({ type: FamilyResponseDto })
  create(@CurrentUser() user: UserPayload, @Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.create(user.sub, { ...createFamilyDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:family:read")
  @ApiOperation({ summary: "查询家庭列表" })
  @ZodResponse({ type: FamilyPageResponseDto })
  list(@Query() query: FamilyListQueryDto) {
    return this.familyService.list(query)
  }

  @Get("find")
  @Permission("fin:family:read")
  @ApiOperation({ summary: "查询家庭详情" })
  @ZodResponse({ type: FamilyResponseDto })
  find(@Query("id") id: string) {
    return this.familyService.find(id)
  }

  @Post("update")
  @Permission("fin:family:update")
  @ApiOperation({ summary: "更新家庭" })
  @ZodResponse({ type: FamilyResponseDto })
  update(@Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(updateFamilyDto.id, updateFamilyDto)
  }

  @Post("delete")
  @Permission("fin:family:delete")
  @ApiOperation({ summary: "删除家庭" })
  delete(@Body() deleteFamilyDto: DeleteFamilyDto) {
    return this.familyService.delete(deleteFamilyDto.id)
  }
}
