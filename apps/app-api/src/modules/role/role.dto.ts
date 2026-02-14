import {
  AppRole,
  appRoleListQuerySchema,
  appRolePageResponseSchema,
  appRoleResponseSchema,
  CreateAppRole,
  createAppRoleSchema,
  deleteAppRoleSchema,
  UpdateAppRole,
  updateAppRoleSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedRoleResponseSchema = appRoleResponseSchema as z.ZodType<AppRole>
const typedCreateRoleSchema = createAppRoleSchema as z.ZodType<CreateAppRole>
const typedUpdateRoleSchema = updateAppRoleSchema as z.ZodType<UpdateAppRole>
const typedDeleteRoleSchema = deleteAppRoleSchema as z.ZodType<{ roleId: string }>

export class RoleResponseDto extends createZodDto(typedRoleResponseSchema) {}
export class CreateRoleDto extends createZodDto(typedCreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(typedUpdateRoleSchema) {}
export class DeleteRoleDto extends createZodDto(typedDeleteRoleSchema) {}
export class RoleListQueryDto extends createZodDto(appRoleListQuerySchema) {}
export class RolePageResponseDto extends createZodDto(appRolePageResponseSchema) {}
