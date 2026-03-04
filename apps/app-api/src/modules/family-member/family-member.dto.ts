import {
  CreateFamilyMember,
  createFamilyMemberSchema,
  FamilyMember,
  familyMemberListQuerySchema,
  familyMemberPageResponseSchema,
  familyMemberResponseSchema,
  RemoveFamilyMemberByUserId,
  removeFamilyMemberByUserIdSchema,
  UpdateFamilyMember,
  updateFamilyMemberSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedFamilyMemberResponseSchema = familyMemberResponseSchema as z.ZodType<FamilyMember>
const typedCreateFamilyMemberSchema = createFamilyMemberSchema as z.ZodType<CreateFamilyMember>
const typedUpdateFamilyMemberSchema = updateFamilyMemberSchema as z.ZodType<UpdateFamilyMember>
const typedRemoveFamilyMemberByUserIdSchema = removeFamilyMemberByUserIdSchema as z.ZodType<RemoveFamilyMemberByUserId>

export class FamilyMemberResponseDto extends createZodDto(typedFamilyMemberResponseSchema) {}
export class CreateFamilyMemberDto extends createZodDto(typedCreateFamilyMemberSchema) {}
export class UpdateFamilyMemberDto extends createZodDto(typedUpdateFamilyMemberSchema) {}
export class RemoveFamilyMemberByUserIdDto extends createZodDto(typedRemoveFamilyMemberByUserIdSchema) {}
export class FamilyMemberListQueryDto extends createZodDto(familyMemberListQuerySchema) {}
export class FamilyMemberPageResponseDto extends createZodDto(familyMemberPageResponseSchema) {}

const deleteFamilyMemberSchema = z.object({
  id: z.uuid(),
})

export class DeleteFamilyMemberDto extends createZodDto(deleteFamilyMemberSchema) {}
