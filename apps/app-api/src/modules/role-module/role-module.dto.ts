import {
  AppRoleModule,
  appRoleModuleListQuerySchema,
  appRoleModulePageResponseSchema,
  appRoleModuleResponseSchema,
  CreateAppRoleModule,
  createAppRoleModuleSchema,
  deleteAppRoleModuleSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedRoleModuleResponseSchema = appRoleModuleResponseSchema as z.ZodType<AppRoleModule>
const typedCreateRoleModuleSchema = createAppRoleModuleSchema as z.ZodType<CreateAppRoleModule>
const typedDeleteRoleModuleSchema = deleteAppRoleModuleSchema as z.ZodType<{
  roleId: string
  moduleId: string
}>

export class RoleModuleResponseDto extends createZodDto(typedRoleModuleResponseSchema) {}
export class RoleModulePageResponseDto extends createZodDto(appRoleModulePageResponseSchema) {}
export class CreateRoleModuleDto extends createZodDto(typedCreateRoleModuleSchema) {}
export class DeleteRoleModuleDto extends createZodDto(typedDeleteRoleModuleSchema) {}
export class RoleModuleListQueryDto extends createZodDto(appRoleModuleListQuerySchema) {}
