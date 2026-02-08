import type { AppModule, CreateAppModule, UpdateAppModule } from "@goi/contracts/app/module"
import {
  appModuleAllQuerySchema,
  appModuleListQuerySchema,
  appModuleListResponseSchema,
  appModulePageResponseSchema,
  appModuleResponseSchema,
  createAppModuleSchema,
  deleteAppModuleSchema,
  updateAppModuleSchema,
} from "@goi/contracts/app/module"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedModuleResponseSchema = appModuleResponseSchema as z.ZodType<AppModule>
const typedCreateModuleSchema = createAppModuleSchema as z.ZodType<CreateAppModule>
const typedUpdateModuleSchema = updateAppModuleSchema as z.ZodType<UpdateAppModule>
const typedDeleteModuleSchema = deleteAppModuleSchema as z.ZodType<{ moduleId: string }>
const typedModuleListResponseSchema = appModuleListResponseSchema as z.ZodType<AppModule[]>

export class ModuleResponseDto extends createZodDto(typedModuleResponseSchema) {}
export class CreateModuleDto extends createZodDto(typedCreateModuleSchema) {}
export class UpdateModuleDto extends createZodDto(typedUpdateModuleSchema) {}
export class DeleteModuleDto extends createZodDto(typedDeleteModuleSchema) {}
export class ModuleListQueryDto extends createZodDto(appModuleListQuerySchema) {}
export class ModuleAllQueryDto extends createZodDto(appModuleAllQuerySchema) {}
export class ModulePageResponseDto extends createZodDto(appModulePageResponseSchema) {}
export class ModuleListResponseDto extends createZodDto(typedModuleListResponseSchema) {}
