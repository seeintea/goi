import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const familyMemberSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  userId: z.uuid(),
  roleId: z.uuid(),
  status: z.string().min(1).max(20).default("ACTIVE"),
  isDeleted: z.boolean().default(false),
  joinedAt: z.date(),
})

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
    id: z.uuid(),
  })

export const familyMemberResponseSchema = familyMemberSchema

export const familyMemberListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  userId: z.string().optional(),
  roleId: z.string().optional(),
})

export const familyMemberPageResponseSchema = pageResponseSchema(familyMemberResponseSchema)

export type FamilyMember = z.infer<typeof familyMemberSchema>
export type CreateFamilyMember = z.infer<typeof createFamilyMemberSchema>
export type UpdateFamilyMember = z.infer<typeof updateFamilyMemberSchema>
