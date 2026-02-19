import {
  AppRole,
  appRoleListQuerySchema,
  appRolePageResponseSchema,
  appRoleResponseSchema,
  CreateAppRole,
  createAppRoleSchema,
  deleteAppRoleSchema,
  UpdateAppRole,
  UpdateAppRoleStatus,
  UpdateRolePermissions,
  updateAppRoleSchema,
  updateAppRoleStatusSchema,
  updateRolePermissionsSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedRoleResponseSchema = appRoleResponseSchema.extend({
  allowDelete: z.boolean(),
  allowDisable: z.boolean(),
}) as z.ZodType<AppRole & { allowDelete: boolean; allowDisable: boolean }>
const typedCreateRoleSchema = createAppRoleSchema as z.ZodType<CreateAppRole>
const typedUpdateRoleSchema = updateAppRoleSchema as z.ZodType<UpdateAppRole>
const typedUpdateRoleStatusSchema = updateAppRoleStatusSchema as z.ZodType<UpdateAppRoleStatus>
const typedDeleteRoleSchema = deleteAppRoleSchema as z.ZodType<{ roleId: string }>
const typedUpdateRolePermissionsSchema = updateRolePermissionsSchema as z.ZodType<UpdateRolePermissions>

const typedRolePageResponseSchema = appRolePageResponseSchema.extend({
  list: z.array(typedRoleResponseSchema),
})

export class RoleResponseDto extends createZodDto(typedRoleResponseSchema) {
  declare allowDelete: boolean
  declare allowDisable: boolean
}
export class CreateRoleDto extends createZodDto(typedCreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(typedUpdateRoleSchema) {}
export class UpdateRoleStatusDto extends createZodDto(typedUpdateRoleStatusSchema) {}
export class DeleteRoleDto extends createZodDto(typedDeleteRoleSchema) {}
export class RoleListQueryDto extends createZodDto(appRoleListQuerySchema) {}
export class RolePageResponseDto extends createZodDto(typedRolePageResponseSchema) {}
export class UpdateRolePermissionsDto extends createZodDto(typedUpdateRolePermissionsSchema) {}

export type Role = AppRole & {
  allowDelete: boolean
  allowDisable: boolean
}
export type CreateRole = CreateAppRole
export type UpdateRole = UpdateAppRole
export type { UpdateRolePermissions }
