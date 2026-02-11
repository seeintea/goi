import { Module } from "@nestjs/common"
import { AppModuleModule } from "../module/module.module"
import { PermissionController } from "./permission.controller"
import { PermissionService } from "./permission.service"

@Module({
  imports: [AppModuleModule],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class AppPermissionModule {}
