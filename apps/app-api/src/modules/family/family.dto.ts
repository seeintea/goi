import {
  CreateFamily,
  createFamilySchema,
  Family,
  familyListQuerySchema,
  familyPageResponseSchema,
  familyResponseSchema,
  GenerateInviteCode,
  generateInviteCodeSchema,
  InviteCodeResponse,
  inviteCodeResponseSchema,
  UpdateFamily,
  updateFamilySchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedFamilyResponseSchema = familyResponseSchema as z.ZodType<Family>
const typedCreateFamilySchema = createFamilySchema as z.ZodType<CreateFamily>
const typedUpdateFamilySchema = updateFamilySchema as z.ZodType<UpdateFamily>
const typedGenerateInviteCodeSchema = generateInviteCodeSchema as z.ZodType<GenerateInviteCode>
const typedInviteCodeResponseSchema = inviteCodeResponseSchema as z.ZodType<InviteCodeResponse>

export class FamilyResponseDto extends createZodDto(typedFamilyResponseSchema) {}
export class CreateFamilyDto extends createZodDto(typedCreateFamilySchema) {}
export class UpdateFamilyDto extends createZodDto(typedUpdateFamilySchema) {}
export class FamilyListQueryDto extends createZodDto(familyListQuerySchema) {}
export class FamilyPageResponseDto extends createZodDto(familyPageResponseSchema) {}

const deleteFamilySchema = z.object({
  id: z.uuid(),
})

export class DeleteFamilyDto extends createZodDto(deleteFamilySchema) {}

export class InviteCodeResponseDto extends createZodDto(typedInviteCodeResponseSchema) {}
export class GenerateInviteCodeDto extends createZodDto(typedGenerateInviteCodeSchema) {}

const joinFamilySchema = z.object({
  familyId: z.string(),
})
export class JoinFamilyDto extends createZodDto(joinFamilySchema) {}
