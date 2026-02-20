import { Module } from "@nestjs/common"
import { FamilyMemberModule } from "../family-member/family-member.module"
import { RoleModule } from "../role/role.module"
import { FamilyController } from "./family.controller"
import { FamilyService } from "./family.service"

@Module({
  imports: [RoleModule, FamilyMemberModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
