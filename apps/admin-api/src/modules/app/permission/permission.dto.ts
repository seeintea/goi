import {
  AppPermission,
  AppPermissionTreeResponse,
  appPermissionListQuerySchema,
  appPermissionPageResponseSchema,
  appPermissionResponseSchema,
  appPermissionTreeResponseSchema,
  CreateAppPermission,
  createAppPermissionSchema,
  deleteAppPermissionSchema,
  UpdateAppPermission,
  UpdateAppPermissionStatus,
  updateAppPermissionSchema,
  updateAppPermissionStatusSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedPermissionResponseSchema = appPermissionResponseSchema as z.ZodType<AppPermission>
const typedCreatePermissionSchema = createAppPermissionSchema as z.ZodType<CreateAppPermission>
const typedUpdatePermissionSchema = updateAppPermissionSchema as z.ZodType<UpdateAppPermission>
const typedUpdatePermissionStatusSchema = updateAppPermissionStatusSchema as z.ZodType<UpdateAppPermissionStatus>
const typedDeletePermissionSchema = deleteAppPermissionSchema as z.ZodType<{ permissionId: string }>
const typedAppPermissionTreeResponseSchema = appPermissionTreeResponseSchema as z.ZodType<AppPermissionTreeResponse>

export class PermissionResponseDto extends createZodDto(typedPermissionResponseSchema) {}
export class CreatePermissionDto extends createZodDto(typedCreatePermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(typedUpdatePermissionSchema) {}
export class UpdatePermissionStatusDto extends createZodDto(typedUpdatePermissionStatusSchema) {}
export class DeletePermissionDto extends createZodDto(typedDeletePermissionSchema) {}
export class PermissionListQueryDto extends createZodDto(appPermissionListQuerySchema) {}
export class PermissionPageResponseDto extends createZodDto(appPermissionPageResponseSchema) {}
export class AppPermissionTreeResponseDto extends createZodDto(typedAppPermissionTreeResponseSchema) {}
