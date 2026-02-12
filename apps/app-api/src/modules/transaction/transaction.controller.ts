import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  CreateTransactionDto,
  DeleteTransactionDto,
  TransactionListQueryDto,
  TransactionPageResponseDto,
  TransactionResponseDto,
  UpdateTransactionDto,
} from "./transaction.dto"
import { TransactionService } from "./transaction.service"

@ApiTags("交易管理")
@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post("create")
  @Permission("fin:transaction:create")
  @ApiOperation({ summary: "创建交易" })
  @ZodResponse({ type: TransactionResponseDto })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create({ ...createTransactionDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:transaction:read")
  @ApiOperation({ summary: "查询交易列表" })
  @ZodResponse({ type: TransactionPageResponseDto })
  list(@Query() query: TransactionListQueryDto) {
    return this.transactionService.list(query)
  }

  @Get("find")
  @Permission("fin:transaction:read")
  @ApiOperation({ summary: "查询交易详情" })
  @ZodResponse({ type: TransactionResponseDto })
  find(@Query("id") id: string) {
    return this.transactionService.find(id)
  }

  @Post("update")
  @Permission("fin:transaction:update")
  @ApiOperation({ summary: "更新交易" })
  @ZodResponse({ type: TransactionResponseDto })
  update(@Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(updateTransactionDto)
  }

  @Post("delete")
  @Permission("fin:transaction:delete")
  @ApiOperation({ summary: "删除交易" })
  delete(@Body() deleteTransactionDto: DeleteTransactionDto) {
    return this.transactionService.delete(deleteTransactionDto.id)
  }
}
