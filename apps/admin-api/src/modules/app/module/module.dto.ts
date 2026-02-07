import type { CreateModule, Module, UpdateModule } from "@goi/contracts/app/module"
import {
  createModuleSchema,
  deleteModuleSchema,
  moduleAllQuerySchema,
  moduleListQuerySchema,
  moduleListResponseSchema,
  modulePageResponseSchema,
  moduleResponseSchema,
  updateModuleSchema,
} from "@goi/contracts/app/module"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedModuleResponseSchema = moduleResponseSchema as z.ZodType<Module>
const typedCreateModuleSchema = createModuleSchema as z.ZodType<CreateModule>
const typedUpdateModuleSchema = updateModuleSchema as z.ZodType<UpdateModule>
const typedDeleteModuleSchema = deleteModuleSchema as z.ZodType<{ moduleId: string }>
const typedModuleListResponseSchema = moduleListResponseSchema as z.ZodType<Module[]>

export class ModuleResponseDto extends createZodDto(typedModuleResponseSchema) {}
export class CreateModuleDto extends createZodDto(typedCreateModuleSchema) {}
export class UpdateModuleDto extends createZodDto(typedUpdateModuleSchema) {}
export class DeleteModuleDto extends createZodDto(typedDeleteModuleSchema) {}
export class ModuleListQueryDto extends createZodDto(moduleListQuerySchema) {}
export class ModuleAllQueryDto extends createZodDto(moduleAllQuerySchema) {}
export class ModulePageResponseDto extends createZodDto(modulePageResponseSchema) {}
export class ModuleListResponseDto extends createZodDto(typedModuleListResponseSchema) {}
