import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

extendZodWithOpenApi(z)

export const familySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    ownerUserId: z.string().min(1).max(32),
    baseCurrency: z.string().min(1).max(10).default("CNY"),
    timezone: z.string().min(1).max(50).default("Asia/Shanghai"),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("Family")

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
    id: z.string().uuid(),
  })

export const familyResponseSchema = familySchema

export const familyListQuerySchema = pageQuerySchema.extend({
  name: z.string().optional(),
})

export const familyPageResponseSchema = pageResponseSchema(familyResponseSchema)

export type Family = z.infer<typeof familySchema>
export type CreateFamily = z.infer<typeof createFamilySchema>
export type UpdateFamily = z.infer<typeof updateFamilySchema>
