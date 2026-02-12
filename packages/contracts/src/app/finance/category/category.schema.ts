import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const categorySchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(20), // EXPENSE, INCOME
  parentId: z.uuid().optional().nullable(),
  isHidden: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createCategorySchema = categorySchema.pick({
  familyId: true,
  name: true,
  type: true,
  parentId: true,
  isHidden: true,
  sortOrder: true,
  icon: true,
  color: true,
})

export const updateCategorySchema = categorySchema
  .pick({
    name: true,
    type: true,
    parentId: true,
    isHidden: true,
    sortOrder: true,
    icon: true,
    color: true,
  })
  .partial()
  .extend({
    id: z.uuid(),
  })

export const categoryResponseSchema = categorySchema

export const categoryListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  type: z.string().optional(),
  name: z.string().optional(),
})

export const categoryPageResponseSchema = pageResponseSchema(categoryResponseSchema)

export type Category = z.infer<typeof categorySchema>
export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>
