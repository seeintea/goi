import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const transactionSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  accountId: z.uuid(),
  toAccountId: z.uuid().optional().nullable(),
  categoryId: z.uuid().optional().nullable(),
  amount: z.string(), // Decimal as string
  type: z.string().min(1).max(20), // EXPENSE, INCOME, TRANSFER
  occurredAt: z.iso.datetime(),
  description: z.string().optional().nullable(),
  createdBy: z.uuid().optional().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

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
    id: z.uuid(),
  })

export const transactionResponseSchema = transactionSchema

export const transactionListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  accountId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.string().optional(),
  keyword: z.string().optional(),
})

export const transactionPageResponseSchema = pageResponseSchema(transactionResponseSchema)

export type Transaction = z.infer<typeof transactionSchema>
export type CreateTransaction = z.infer<typeof createTransactionSchema>
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>
