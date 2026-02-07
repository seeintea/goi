import type { CreatePermission, Permission, UpdatePermission } from "@goi/contracts/app/permission"
import {
  createPermissionSchema,
  deletePermissionSchema,
  permissionListQuerySchema,
  permissionPageResponseSchema,
  permissionResponseSchema,
  updatePermissionSchema,
} from "@goi/contracts/app/permission"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedPermissionResponseSchema = permissionResponseSchema as z.ZodType<Permission>
const typedCreatePermissionSchema = createPermissionSchema as z.ZodType<CreatePermission>
const typedUpdatePermissionSchema = updatePermissionSchema as z.ZodType<UpdatePermission>
const typedDeletePermissionSchema = deletePermissionSchema as z.ZodType<{ permissionId: string }>

export class PermissionResponseDto extends createZodDto(typedPermissionResponseSchema) {}
export class CreatePermissionDto extends createZodDto(typedCreatePermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(typedUpdatePermissionSchema) {}
export class DeletePermissionDto extends createZodDto(typedDeletePermissionSchema) {}
export class PermissionListQueryDto extends createZodDto(permissionListQuerySchema) {}
export class PermissionPageResponseDto extends createZodDto(permissionPageResponseSchema) {}
