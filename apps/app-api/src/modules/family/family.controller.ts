import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@/common/decorators/current-user.decorator"
import type { UserPayload } from "@/common/interfaces/user-payload.interface"
import { CreateFamilyDto, FamilyListQueryDto, UpdateFamilyDto } from "./family.dto"
import { FamilyService } from "./family.service"

@ApiTags("Family")
@Controller("families")
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(@CurrentUser() user: UserPayload, @Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.create(user.sub, createFamilyDto)
  }

  @Get()
  findAll(@Query() query: FamilyListQueryDto) {
    return this.familyService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.familyService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(id, updateFamilyDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.familyService.remove(id)
  }
}
