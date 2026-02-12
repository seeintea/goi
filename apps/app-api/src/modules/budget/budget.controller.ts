import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  BudgetListQueryDto,
  BudgetPageResponseDto,
  BudgetResponseDto,
  CreateBudgetDto,
  DeleteBudgetDto,
  UpdateBudgetDto,
} from "./budget.dto"
import { BudgetService } from "./budget.service"

@ApiTags("预算管理")
@Controller("budgets")
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post("create")
  @Permission("fin:budget:create")
  @ApiOperation({ summary: "创建预算" })
  @ZodResponse({ type: BudgetResponseDto })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create({ ...createBudgetDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:budget:read")
  @ApiOperation({ summary: "查询预算列表" })
  @ZodResponse({ type: BudgetPageResponseDto })
  list(@Query() query: BudgetListQueryDto) {
    return this.budgetService.list(query)
  }

  @Get("find")
  @Permission("fin:budget:read")
  @ApiOperation({ summary: "查询预算详情" })
  @ZodResponse({ type: BudgetResponseDto })
  find(@Query("id") id: string) {
    return this.budgetService.find(id)
  }

  @Post("update")
  @Permission("fin:budget:update")
  @ApiOperation({ summary: "更新预算" })
  @ZodResponse({ type: BudgetResponseDto })
  update(@Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.update(updateBudgetDto)
  }

  @Post("delete")
  @Permission("fin:budget:delete")
  @ApiOperation({ summary: "删除预算" })
  delete(@Body() deleteBudgetDto: DeleteBudgetDto) {
    return this.budgetService.delete(deleteBudgetDto.id)
  }
}
