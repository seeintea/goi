import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CreateFamilyMemberDto, FamilyMemberListQueryDto, UpdateFamilyMemberDto } from "./family-member.dto"
import { FamilyMemberService } from "./family-member.service"

@ApiTags("FamilyMember")
@Controller("family-members")
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Post()
  create(@Body() createFamilyMemberDto: CreateFamilyMemberDto) {
    return this.familyMemberService.create(createFamilyMemberDto)
  }

  @Get()
  findAll(@Query() query: FamilyMemberListQueryDto) {
    return this.familyMemberService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.familyMemberService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFamilyMemberDto: UpdateFamilyMemberDto) {
    return this.familyMemberService.update(id, updateFamilyMemberDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.familyMemberService.remove(id)
  }
}
