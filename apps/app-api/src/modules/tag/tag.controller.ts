import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CreateTagDto, TagListQueryDto, UpdateTagDto } from "./tag.dto"
import { TagService } from "./tag.service"

@ApiTags("Tag")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto)
  }

  @Get()
  findAll(@Query() query: TagListQueryDto) {
    return this.tagService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tagService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tagService.remove(id)
  }
}
