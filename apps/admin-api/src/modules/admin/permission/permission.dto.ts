import {
  AdminPermission,
  adminPermissionListQuerySchema,
  adminPermissionPageResponseSchema,
  adminPermissionResponseSchema,
  CreateAdminPermission,
  createAdminPermissionSchema,
  deleteAdminPermissionSchema,
  UpdateAdminPermission,
  UpdateAdminPermissionStatus,
  updateAdminPermissionSchema,
  updateAdminPermissionStatusSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAdminPermissionResponseSchema = adminPermissionResponseSchema as z.ZodType<AdminPermission>
const typedCreateAdminPermissionSchema = createAdminPermissionSchema as z.ZodType<CreateAdminPermission>
const typedUpdateAdminPermissionSchema = updateAdminPermissionSchema as z.ZodType<UpdateAdminPermission>
const typedUpdateAdminPermissionStatusSchema =
  updateAdminPermissionStatusSchema as z.ZodType<UpdateAdminPermissionStatus>
const typedDeleteAdminPermissionSchema = deleteAdminPermissionSchema as z.ZodType<{ permissionId: string }>

export class AdminPermissionResponseDto extends createZodDto(typedAdminPermissionResponseSchema) {}
export class CreateAdminPermissionDto extends createZodDto(typedCreateAdminPermissionSchema) {}
export class UpdateAdminPermissionDto extends createZodDto(typedUpdateAdminPermissionSchema) {}
export class UpdateAdminPermissionStatusDto extends createZodDto(typedUpdateAdminPermissionStatusSchema) {}
export class DeleteAdminPermissionDto extends createZodDto(typedDeleteAdminPermissionSchema) {}
export class AdminPermissionListQueryDto extends createZodDto(adminPermissionListQuerySchema) {}
export class AdminPermissionPageResponseDto extends createZodDto(adminPermissionPageResponseSchema) {}
