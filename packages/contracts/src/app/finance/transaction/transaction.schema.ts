import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

extendZodWithOpenApi(z)

export const transactionSchema = z
  .object({
    id: z.string().uuid(),
    familyId: z.string().uuid(),
    accountId: z.string().uuid(),
    toAccountId: z.string().uuid().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    amount: z.string(), // Decimal as string
    type: z.string().min(1).max(20), // EXPENSE, INCOME, TRANSFER
    occurredAt: z.date(),
    description: z.string().optional().nullable(),
    createdBy: z.string().min(1).max(32).optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("Transaction")

export const createTransactionSchema = transactionSchema.pick({
  familyId: true,
  accountId: true,
  toAccountId: true,
  categoryId: true,
  amount: true,
  type: true,
  occurredAt: true,
  description: true,
})

export const updateTransactionSchema = transactionSchema
  .pick({
    accountId: true,
    toAccountId: true,
    categoryId: true,
    amount: true,
    type: true,
    occurredAt: true,
    description: true,
  })
  .partial()
  .extend({
    id: z.string().uuid(),
  })

export const transactionResponseSchema = transactionSchema

export const transactionListQuerySchema = pageQuerySchema.extend({
  familyId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.string().optional(),
  keyword: z.string().optional(),
})

export const transactionPageResponseSchema = pageResponseSchema(transactionResponseSchema)

export type Transaction = z.infer<typeof transactionSchema>
export type CreateTransaction = z.infer<typeof createTransactionSchema>
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>
