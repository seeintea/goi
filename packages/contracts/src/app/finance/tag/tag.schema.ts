import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const tagSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.date(),
})

export const createTagSchema = tagSchema.pick({
  familyId: true,
  name: true,
  color: true,
})

export const updateTagSchema = tagSchema
  .pick({
    name: true,
    color: true,
  })
  .partial()
  .extend({
    id: z.uuid(),
  })

export const tagResponseSchema = tagSchema

export const tagListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  name: z.string().optional(),
})

export const tagPageResponseSchema = pageResponseSchema(tagResponseSchema)

export type Tag = z.infer<typeof tagSchema>
export type CreateTag = z.infer<typeof createTagSchema>
export type UpdateTag = z.infer<typeof updateTagSchema>
