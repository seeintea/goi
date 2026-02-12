import { Permission } from "@goi/nest-kit"
import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { v4 as uuid } from "uuid"
import {
  AccountListQueryDto,
  AccountPageResponseDto,
  AccountResponseDto,
  CreateAccountDto,
  DeleteAccountDto,
  UpdateAccountDto,
} from "./account.dto"
import { AccountService } from "./account.service"

@ApiTags("账户管理")
@Controller("accounts")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post("create")
  @Permission("fin:account:create")
  @ApiOperation({ summary: "创建账户" })
  @ZodResponse({ type: AccountResponseDto })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create({ ...createAccountDto, id: uuid() })
  }

  @Get("list")
  @Permission("fin:account:read")
  @ApiOperation({ summary: "查询账户列表" })
  @ZodResponse({ type: AccountPageResponseDto })
  list(@Query() query: AccountListQueryDto) {
    return this.accountService.list(query)
  }

  @Get("find")
  @Permission("fin:account:read")
  @ApiOperation({ summary: "查询账户详情" })
  @ZodResponse({ type: AccountResponseDto })
  find(@Query("id") id: string) {
    return this.accountService.find(id)
  }

  @Post("update")
  @Permission("fin:account:update")
  @ApiOperation({ summary: "更新账户" })
  @ZodResponse({ type: AccountResponseDto })
  update(@Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(updateAccountDto)
  }

  @Post("delete")
  @Permission("fin:account:delete")
  @ApiOperation({ summary: "删除账户" })
  delete(@Body() deleteAccountDto: DeleteAccountDto) {
    return this.accountService.delete(deleteAccountDto.id)
  }
}
