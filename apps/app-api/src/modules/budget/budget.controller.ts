import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { BudgetListQueryDto, CreateBudgetDto, UpdateBudgetDto } from "./budget.dto"
import { BudgetService } from "./budget.service"

@ApiTags("Budget")
@Controller("budgets")
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto)
  }

  @Get()
  findAll(@Query() query: BudgetListQueryDto) {
    return this.budgetService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.budgetService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.update(id, updateBudgetDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.budgetService.remove(id)
  }
}
