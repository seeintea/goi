import { Module } from "@nestjs/common"
import { RoleModuleController } from "./role-module.controller"
import { RoleModuleService } from "./role-module.service"

@Module({
  controllers: [RoleModuleController],
  providers: [RoleModuleService],
  exports: [RoleModuleService],
})
export class RoleModuleModule {}
