import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { AccountListQueryDto, CreateAccountDto, UpdateAccountDto } from "./account.dto"
import { AccountService } from "./account.service"

@ApiTags("Account")
@Controller("accounts")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto)
  }

  @Get()
  findAll(@Query() query: AccountListQueryDto) {
    return this.accountService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.accountService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.accountService.remove(id)
  }
}
