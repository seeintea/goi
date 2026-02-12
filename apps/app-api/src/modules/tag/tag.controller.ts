import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  CreateTagDto,
  DeleteTagDto,
  TagListQueryDto,
  TagPageResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from "./tag.dto"
import { TagService } from "./tag.service"

@ApiTags("标签管理")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post("create")
  @Permission("fin:tag:create")
  @ApiOperation({ summary: "创建标签" })
  @ZodResponse({ type: TagResponseDto })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create({ ...createTagDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:tag:read")
  @ApiOperation({ summary: "查询标签列表" })
  @ZodResponse({ type: TagPageResponseDto })
  list(@Query() query: TagListQueryDto) {
    return this.tagService.list(query)
  }

  @Get("find")
  @Permission("fin:tag:read")
  @ApiOperation({ summary: "查询标签详情" })
  @ZodResponse({ type: TagResponseDto })
  find(@Query("id") id: string) {
    return this.tagService.find(id)
  }

  @Post("update")
  @Permission("fin:tag:update")
  @ApiOperation({ summary: "更新标签" })
  @ZodResponse({ type: TagResponseDto })
  update(@Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(updateTagDto)
  }

  @Post("delete")
  @Permission("fin:tag:delete")
  @ApiOperation({ summary: "删除标签" })
  delete(@Body() deleteTagDto: DeleteTagDto) {
    return this.tagService.delete(deleteTagDto.id)
  }
}
