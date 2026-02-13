import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const budgetSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  categoryId: z.uuid().optional().nullable(),
  amount: z.string(), // Decimal as string
  periodType: z.string().min(1).max(20).default("MONTHLY"), // MONTHLY, YEARLY, ONE_OFF
  startDate: z.string(), // Date string YYYY-MM-DD
  endDate: z.string().optional().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createBudgetSchema = budgetSchema.pick({
  familyId: true,
  categoryId: true,
  amount: true,
  periodType: true,
  startDate: true,
  endDate: true,
})

export const updateBudgetSchema = budgetSchema
  .pick({
    categoryId: true,
    amount: true,
    periodType: true,
    startDate: true,
    endDate: true,
  })
  .partial()
  .extend({
    id: z.uuid(),
  })

export const budgetResponseSchema = budgetSchema

export const budgetListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  periodType: z.string().optional(),
})

export const budgetPageResponseSchema = pageResponseSchema(budgetResponseSchema)

export type Budget = z.infer<typeof budgetSchema>
export type CreateBudget = z.infer<typeof createBudgetSchema>
export type UpdateBudget = z.infer<typeof updateBudgetSchema>
