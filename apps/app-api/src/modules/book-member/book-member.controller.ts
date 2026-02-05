import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import { BookId } from "@/common/decorators/current-user.decorator"
import { Permission } from "@/common/decorators/permission.decorator"
import {
  BookMemberListQueryDto,
  BookMemberPageResponseDto,
  BookMemberResponseDto,
  CreateBookMemberDto,
  DeleteBookMemberDto,
  UpdateBookMemberDto,
} from "./book-member.dto"
import { BookMemberService } from "./book-member.service"

@ApiTags("账本成员")
@Controller("ff/book-member")
export class BookMemberController {
  constructor(private readonly bookMemberService: BookMemberService) {}

  @Post("create")
  @Permission("member:invite")
  @ApiOperation({ summary: "创建账本成员" })
  @ZodResponse({ type: BookMemberResponseDto })
  async create(@BookId() bookId: string, @Body() body: CreateBookMemberDto) {
    return this.bookMemberService.create({ ...body, bookId, memberId: nanoid(32) })
  }

  @Get("find")
  @Permission("member:read")
  @ApiOperation({ summary: "查询账本成员" })
  @ZodResponse({ type: BookMemberResponseDto })
  async find(@BookId() bookId: string, @Query("memberId") memberId: string) {
    return this.bookMemberService.find(bookId, memberId)
  }

  @Get("list")
  @Permission("member:read")
  @ApiOperation({ summary: "查询账本成员列表" })
  @ZodResponse({ type: BookMemberPageResponseDto })
  async list(@BookId() bookId: string, @Query() query: BookMemberListQueryDto) {
    return this.bookMemberService.list(bookId, query)
  }

  @Post("update")
  @Permission("member:manage")
  @ApiOperation({ summary: "更新账本成员" })
  @ZodResponse({ type: BookMemberResponseDto })
  async update(@BookId() bookId: string, @Body() body: UpdateBookMemberDto) {
    return this.bookMemberService.update(bookId, body)
  }

  @Post("delete")
  @Permission("member:manage")
  @ApiOperation({ summary: "删除账本成员" })
  async delete(@BookId() bookId: string, @Body() body: DeleteBookMemberDto) {
    return this.bookMemberService.delete(bookId, body.memberId)
  }
}
