import {
  CreateFamily,
  createFamilySchema,
  Family,
  familyListQuerySchema,
  familyPageResponseSchema,
  familyResponseSchema,
  UpdateFamily,
  updateFamilySchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedFamilyResponseSchema = familyResponseSchema as z.ZodType<Family>
const typedCreateFamilySchema = createFamilySchema as z.ZodType<CreateFamily>
const typedUpdateFamilySchema = updateFamilySchema as z.ZodType<UpdateFamily>

export class FamilyResponseDto extends createZodDto(typedFamilyResponseSchema) {}
export class CreateFamilyDto extends createZodDto(typedCreateFamilySchema) {}
export class UpdateFamilyDto extends createZodDto(typedUpdateFamilySchema) {}
export class FamilyListQueryDto extends createZodDto(familyListQuerySchema) {}
export class FamilyPageResponseDto extends createZodDto(familyPageResponseSchema) {}
