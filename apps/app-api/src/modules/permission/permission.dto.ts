import {
  AppPermission,
  appPermissionListQuerySchema,
  appPermissionPageResponseSchema,
  appPermissionResponseSchema,
  CreateAppPermission,
  createAppPermissionSchema,
  deleteAppPermissionSchema,
  UpdateAppPermission,
  updateAppPermissionSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedPermissionResponseSchema = appPermissionResponseSchema as z.ZodType<AppPermission>
const typedCreatePermissionSchema = createAppPermissionSchema as z.ZodType<CreateAppPermission>
const typedUpdatePermissionSchema = updateAppPermissionSchema as z.ZodType<UpdateAppPermission>
const typedDeletePermissionSchema = deleteAppPermissionSchema as z.ZodType<{ permissionId: string }>

export class PermissionResponseDto extends createZodDto(typedPermissionResponseSchema) {}
export class CreatePermissionDto extends createZodDto(typedCreatePermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(typedUpdatePermissionSchema) {}
export class DeletePermissionDto extends createZodDto(typedDeletePermissionSchema) {}
export class PermissionListQueryDto extends createZodDto(appPermissionListQuerySchema) {}
export class PermissionPageResponseDto extends createZodDto(appPermissionPageResponseSchema) {}
