import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

extendZodWithOpenApi(z)

export const tagSchema = z
  .object({
    id: z.string().uuid(),
    familyId: z.string().uuid(),
    name: z.string().min(1).max(50),
    color: z.string().max(20).optional().nullable(),
    createdAt: z.date(),
  })
  .openapi("Tag")

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
    id: z.string().uuid(),
  })

export const tagResponseSchema = tagSchema

export const tagListQuerySchema = pageQuerySchema.extend({
  familyId: z.string().uuid(),
  name: z.string().optional(),
})

export const tagPageResponseSchema = pageResponseSchema(tagResponseSchema)

export type Tag = z.infer<typeof tagSchema>
export type CreateTag = z.infer<typeof createTagSchema>
export type UpdateTag = z.infer<typeof updateTagSchema>
