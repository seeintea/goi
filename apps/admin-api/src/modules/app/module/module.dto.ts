import {
  AppModule,
  appModuleAllQuerySchema,
  appModuleListQuerySchema,
  appModuleListResponseSchema,
  appModulePageResponseSchema,
  appModuleResponseSchema,
  CreateAppModule,
  createAppModuleSchema,
  deleteAppModuleSchema,
  UpdateAppModule,
  updateAppModuleSchema,
  updateAppModuleSortSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedModuleResponseSchema = appModuleResponseSchema as z.ZodType<AppModule>
const typedCreateModuleSchema = createAppModuleSchema as z.ZodType<CreateAppModule>
const typedUpdateModuleSchema = updateAppModuleSchema as z.ZodType<UpdateAppModule>
const typedUpdateModuleSortSchema = updateAppModuleSortSchema as z.ZodType<{
  parentId: string | null
  moduleIds: string[]
}>
const typedDeleteModuleSchema = deleteAppModuleSchema as z.ZodType<{ moduleId: string }>
const typedModuleListResponseSchema = appModuleListResponseSchema as z.ZodType<AppModule[]>

export class ModuleResponseDto extends createZodDto(typedModuleResponseSchema) {}
export class CreateModuleDto extends createZodDto(typedCreateModuleSchema) {}
export class UpdateModuleDto extends createZodDto(typedUpdateModuleSchema) {}
export class UpdateModuleSortDto extends createZodDto(typedUpdateModuleSortSchema) {}
export class DeleteModuleDto extends createZodDto(typedDeleteModuleSchema) {}
export class ModuleListQueryDto extends createZodDto(appModuleListQuerySchema) {}
export class ModuleAllQueryDto extends createZodDto(appModuleAllQuerySchema) {}
export class ModulePageResponseDto extends createZodDto(appModulePageResponseSchema) {}
export class ModuleListResponseDto extends createZodDto(typedModuleListResponseSchema) {}
