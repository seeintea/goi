import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CreateTransactionDto, TransactionListQueryDto, UpdateTransactionDto } from "./transaction.dto"
import { TransactionService } from "./transaction.service"

@ApiTags("Transaction")
@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto)
  }

  @Get()
  findAll(@Query() query: TransactionListQueryDto) {
    return this.transactionService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.transactionService.remove(id)
  }
}
