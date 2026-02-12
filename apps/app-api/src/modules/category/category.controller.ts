import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  CategoryListQueryDto,
  CategoryPageResponseDto,
  CategoryResponseDto,
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
} from "./category.dto"
import { CategoryService } from "./category.service"

@ApiTags("分类管理")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post("create")
  @Permission("fin:category:create")
  @ApiOperation({ summary: "创建分类" })
  @ZodResponse({ type: CategoryResponseDto })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create({ ...createCategoryDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:category:read")
  @ApiOperation({ summary: "查询分类列表" })
  @ZodResponse({ type: CategoryPageResponseDto })
  list(@Query() query: CategoryListQueryDto) {
    return this.categoryService.list(query)
  }

  @Get("find")
  @Permission("fin:category:read")
  @ApiOperation({ summary: "查询分类详情" })
  @ZodResponse({ type: CategoryResponseDto })
  find(@Query("id") id: string) {
    return this.categoryService.find(id)
  }

  @Post("update")
  @Permission("fin:category:update")
  @ApiOperation({ summary: "更新分类" })
  @ZodResponse({ type: CategoryResponseDto })
  update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(updateCategoryDto)
  }

  @Post("delete")
  @Permission("fin:category:delete")
  @ApiOperation({ summary: "删除分类" })
  delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
    return this.categoryService.delete(deleteCategoryDto.id)
  }
}
