import {
  CreateFamilyMember,
  createFamilyMemberSchema,
  FamilyMember,
  familyMemberListQuerySchema,
  familyMemberPageResponseSchema,
  familyMemberResponseSchema,
  UpdateFamilyMember,
  updateFamilyMemberSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedFamilyMemberResponseSchema = familyMemberResponseSchema as z.ZodType<FamilyMember>
const typedCreateFamilyMemberSchema = createFamilyMemberSchema as z.ZodType<CreateFamilyMember>
const typedUpdateFamilyMemberSchema = updateFamilyMemberSchema as z.ZodType<UpdateFamilyMember>

export class FamilyMemberResponseDto extends createZodDto(typedFamilyMemberResponseSchema) {}
export class CreateFamilyMemberDto extends createZodDto(typedCreateFamilyMemberSchema) {}
export class UpdateFamilyMemberDto extends createZodDto(typedUpdateFamilyMemberSchema) {}
export class FamilyMemberListQueryDto extends createZodDto(familyMemberListQuerySchema) {}
export class FamilyMemberPageResponseDto extends createZodDto(familyMemberPageResponseSchema) {}

const deleteFamilyMemberSchema = z.object({
  id: z.uuid(),
})

export class DeleteFamilyMemberDto extends createZodDto(deleteFamilyMemberSchema) {}
