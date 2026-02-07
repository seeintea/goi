import { Module } from "@nestjs/common"
import { AdminModuleController } from "./admin-module.controller"
import { AdminModuleService } from "./admin-module.service"

@Module({
  controllers: [AdminModuleController],
  providers: [AdminModuleService],
})
export class AdminSysModuleModule {}
