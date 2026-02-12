import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

extendZodWithOpenApi(z)

export const budgetSchema = z
  .object({
    id: z.string().uuid(),
    familyId: z.string().uuid(),
    categoryId: z.string().uuid().optional().nullable(),
    amount: z.string(), // Decimal as string
    periodType: z.string().min(1).max(20).default("MONTHLY"), // MONTHLY, YEARLY, ONE_OFF
    startDate: z.string(), // Date string YYYY-MM-DD
    endDate: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("Budget")

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
    id: z.string().uuid(),
  })

export const budgetResponseSchema = budgetSchema

export const budgetListQuerySchema = pageQuerySchema.extend({
  familyId: z.string().uuid(),
  periodType: z.string().optional(),
})

export const budgetPageResponseSchema = pageResponseSchema(budgetResponseSchema)

export type Budget = z.infer<typeof budgetSchema>
export type CreateBudget = z.infer<typeof createBudgetSchema>
export type UpdateBudget = z.infer<typeof updateBudgetSchema>
