import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CategoryListQueryDto, CreateCategoryDto, UpdateCategoryDto } from "./category.dto"
import { CategoryService } from "./category.service"

@ApiTags("Category")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get()
  findAll(@Query() query: CategoryListQueryDto) {
    return this.categoryService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoryService.remove(id)
  }
}
