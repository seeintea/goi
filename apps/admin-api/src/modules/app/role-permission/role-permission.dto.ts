import {
  AppRolePermission,
  appRolePermissionListQuerySchema,
  appRolePermissionPageResponseSchema,
  appRolePermissionResponseSchema,
  CreateAppRolePermission,
  createAppRolePermissionSchema,
  deleteAppRolePermissionSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedRolePermissionResponseSchema = appRolePermissionResponseSchema as z.ZodType<AppRolePermission>
const typedCreateRolePermissionSchema = createAppRolePermissionSchema as z.ZodType<CreateAppRolePermission>
const typedDeleteRolePermissionSchema = deleteAppRolePermissionSchema as z.ZodType<{
  roleId: string
  permissionId: string
}>

export class RolePermissionResponseDto extends createZodDto(typedRolePermissionResponseSchema) {}
export class CreateRolePermissionDto extends createZodDto(typedCreateRolePermissionSchema) {}
export class DeleteRolePermissionDto extends createZodDto(typedDeleteRolePermissionSchema) {}
export class RolePermissionListQueryDto extends createZodDto(appRolePermissionListQuerySchema) {}
export class RolePermissionPageResponseDto extends createZodDto(appRolePermissionPageResponseSchema) {}

export type RolePermission = AppRolePermission
export type CreateRolePermission = CreateAppRolePermission
