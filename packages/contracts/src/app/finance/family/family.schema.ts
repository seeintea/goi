import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const familySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50),
  ownerUserId: z.uuid(),
  baseCurrency: z.string().min(1).max(10).default("CNY"),
  timezone: z.string().min(1).max(50).default("Asia/Shanghai"),
  isDeleted: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createFamilySchema = familySchema.pick({
  name: true,
  baseCurrency: true,
  timezone: true,
})

export const updateFamilySchema = familySchema
  .pick({
    name: true,
    baseCurrency: true,
    timezone: true,
  })
  .partial()
  .extend({
    id: z.uuid(),
  })

export const familyResponseSchema = familySchema

export const familyListQuerySchema = pageQuerySchema.extend({
  name: z.string().optional(),
})

export const familyPageResponseSchema = pageResponseSchema(familyResponseSchema)

export type Family = z.infer<typeof familySchema>
export type CreateFamily = z.infer<typeof createFamilySchema>
export type UpdateFamily = z.infer<typeof updateFamilySchema>

export const generateInviteCodeSchema = z.object({
  familyId: z.uuid(),
})

export const inviteCodeResponseSchema = z.object({
  code: z.string(),
})

export type GenerateInviteCode = z.infer<typeof generateInviteCodeSchema>
export type InviteCodeResponse = z.infer<typeof inviteCodeResponseSchema>
