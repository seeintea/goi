import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  CreateFamilyMemberDto,
  DeleteFamilyMemberDto,
  FamilyMemberListQueryDto,
  FamilyMemberPageResponseDto,
  FamilyMemberResponseDto,
  UpdateFamilyMemberDto,
} from "./family-member.dto"
import { FamilyMemberService } from "./family-member.service"

@ApiTags("家庭成员管理")
@Controller("family-members")
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Post("create")
  @Permission("fin:family-member:create")
  @ApiOperation({ summary: "创建家庭成员" })
  @ZodResponse({ type: FamilyMemberResponseDto })
  create(@Body() createFamilyMemberDto: CreateFamilyMemberDto) {
    return this.familyMemberService.create({ ...createFamilyMemberDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:family-member:read")
  @ApiOperation({ summary: "查询家庭成员列表" })
  @ZodResponse({ type: FamilyMemberPageResponseDto })
  list(@Query() query: FamilyMemberListQueryDto) {
    return this.familyMemberService.list(query)
  }

  @Get("find")
  @Permission("fin:family-member:read")
  @ApiOperation({ summary: "查询家庭成员详情" })
  @ZodResponse({ type: FamilyMemberResponseDto })
  find(@Query("id") id: string) {
    return this.familyMemberService.find(id)
  }

  @Post("update")
  @Permission("fin:family-member:update")
  @ApiOperation({ summary: "更新家庭成员" })
  @ZodResponse({ type: FamilyMemberResponseDto })
  update(@Body() updateFamilyMemberDto: UpdateFamilyMemberDto) {
    return this.familyMemberService.update(updateFamilyMemberDto.id, updateFamilyMemberDto)
  }

  @Post("delete")
  @Permission("fin:family-member:delete")
  @ApiOperation({ summary: "删除家庭成员" })
  delete(@Body() deleteFamilyMemberDto: DeleteFamilyMemberDto) {
    return this.familyMemberService.delete(deleteFamilyMemberDto.id)
  }
}
