import { Module } from "@nestjs/common"
import { RolePermissionController } from "./role-permission.controller"
import { RolePermissionService } from "./role-permission.service"

@Module({
  imports: [],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
