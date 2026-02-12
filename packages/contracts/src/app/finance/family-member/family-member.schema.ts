import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

extendZodWithOpenApi(z)

export const familyMemberSchema = z
  .object({
    id: z.string().uuid(),
    familyId: z.string().uuid(),
    userId: z.string().min(1).max(32),
    roleId: z.string().min(1).max(32),
    status: z.string().min(1).max(20).default("ACTIVE"),
    joinedAt: z.date(),
  })
  .openapi("FamilyMember")

export const createFamilyMemberSchema = familyMemberSchema.pick({
  familyId: true,
  userId: true,
  roleId: true,
  status: true,
})

export const updateFamilyMemberSchema = familyMemberSchema
  .pick({
    roleId: true,
    status: true,
  })
  .partial()
  .extend({
    id: z.string().uuid(),
  })

export const familyMemberResponseSchema = familyMemberSchema

export const familyMemberListQuerySchema = pageQuerySchema.extend({
  familyId: z.string().uuid(),
  userId: z.string().optional(),
  roleId: z.string().optional(),
})

export const familyMemberPageResponseSchema = pageResponseSchema(familyMemberResponseSchema)

export type FamilyMember = z.infer<typeof familyMemberSchema>
export type CreateFamilyMember = z.infer<typeof createFamilyMemberSchema>
export type UpdateFamilyMember = z.infer<typeof updateFamilyMemberSchema>
