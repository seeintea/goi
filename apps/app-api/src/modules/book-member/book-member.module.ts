import { Module } from "@nestjs/common"
import { BookMemberController } from "./book-member.controller"
import { BookMemberService } from "./book-member.service"

@Module({
  imports: [],
  controllers: [BookMemberController],
  providers: [BookMemberService],
  exports: [BookMemberService],
})
export class BookMemberModule {}

