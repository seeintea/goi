import {
  AdminModule,
  adminModuleAllQuerySchema,
  adminModuleListQuerySchema,
  adminModuleListResponseSchema,
  adminModulePageResponseSchema,
  adminModuleResponseSchema,
  CreateAdminModule,
  createAdminModuleSchema,
  deleteAdminModuleSchema,
  UpdateAdminModule,
  updateAdminModuleSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAdminModuleResponseSchema = adminModuleResponseSchema as z.ZodType<AdminModule>
const typedCreateAdminModuleSchema = createAdminModuleSchema as z.ZodType<CreateAdminModule>
const typedUpdateAdminModuleSchema = updateAdminModuleSchema as z.ZodType<UpdateAdminModule>
const typedDeleteAdminModuleSchema = deleteAdminModuleSchema as z.ZodType<{ moduleId: string }>
const typedAdminModuleListResponseSchema = adminModuleListResponseSchema as z.ZodType<AdminModule[]>

export class AdminModuleResponseDto extends createZodDto(typedAdminModuleResponseSchema) {}
export class CreateAdminModuleDto extends createZodDto(typedCreateAdminModuleSchema) {}
export class UpdateAdminModuleDto extends createZodDto(typedUpdateAdminModuleSchema) {}
export class DeleteAdminModuleDto extends createZodDto(typedDeleteAdminModuleSchema) {}
export class AdminModuleListQueryDto extends createZodDto(adminModuleListQuerySchema) {}
export class AdminModuleAllQueryDto extends createZodDto(adminModuleAllQuerySchema) {}
export class AdminModulePageResponseDto extends createZodDto(adminModulePageResponseSchema) {}
export class AdminModuleListResponseDto extends createZodDto(typedAdminModuleListResponseSchema) {}
