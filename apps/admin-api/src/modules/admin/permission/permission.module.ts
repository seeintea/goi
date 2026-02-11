import { Module } from "@nestjs/common"
import { ModuleModule } from "../module/module.module"
import { PermissionController } from "./permission.controller"
import { PermissionService } from "./permission.service"

@Module({
  imports: [ModuleModule],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
