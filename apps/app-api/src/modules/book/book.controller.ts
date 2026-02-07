import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { nanoid } from "nanoid"
import { ZodResponse } from "nestjs-zod"
import { CurrentUser, Permission } from "@goi/nest-kit/security"
import {
  BookListQueryDto,
  BookPageResponseDto,
  BookResponseDto,
  CreateBookDto,
  DeleteBookDto,
  UpdateBookDto,
} from "./book.dto"
import { BookService } from "./book.service"

@ApiTags("账本")
@Controller("ff/book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post("create")
  @Permission("book:create")
  @ApiOperation({ summary: "创建账本" })
  @ZodResponse({ type: BookResponseDto })
  async create(@CurrentUser() user: { userId: string }, @Body() body: CreateBookDto) {
    return this.bookService.create({ ...body, ownerUserId: user.userId, bookId: nanoid(32) })
  }

  @Get("find")
  @Permission("book:read")
  @ApiOperation({ summary: "查询账本" })
  @ZodResponse({ type: BookResponseDto })
  async find(@CurrentUser() user: { userId: string }, @Query("bookId") bookId: string) {
    return this.bookService.find(bookId, user.userId)
  }

  @Get("list")
  @Permission("book:read")
  @ApiOperation({ summary: "查询账本列表" })
  @ZodResponse({ type: BookPageResponseDto })
  async list(@CurrentUser() user: { userId: string }, @Query() query: BookListQueryDto) {
    return this.bookService.list(query, user.userId)
  }

  @Post("update")
  @Permission("book:update")
  @ApiOperation({ summary: "更新账本" })
  @ZodResponse({ type: BookResponseDto })
  async update(@CurrentUser() user: { userId: string }, @Body() body: UpdateBookDto) {
    return this.bookService.update(body, user.userId)
  }

  @Post("delete")
  @Permission("book:delete")
  @ApiOperation({ summary: "删除账本" })
  async delete(@CurrentUser() user: { userId: string }, @Body() body: DeleteBookDto) {
    return this.bookService.delete(body.bookId, user.userId)
  }
}
