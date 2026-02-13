import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const accountSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(20), // CASH, BANK, CREDIT, INVESTMENT, LOAN
  balance: z.string(), // Decimal as string
  currencyCode: z.string().min(1).max(10).default("CNY"),
  creditLimit: z.string().optional().nullable(),
  billingDay: z.number().int().min(1).max(31).optional().nullable(),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
  excludeFromStats: z.boolean().default(false),
  archived: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isDeleted: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createAccountSchema = accountSchema.pick({
  familyId: true,
  name: true,
  type: true,
  balance: true,
  currencyCode: true,
  creditLimit: true,
  billingDay: true,
  dueDay: true,
  excludeFromStats: true,
  archived: true,
  sortOrder: true,
})

export const updateAccountSchema = accountSchema
  .pick({
    name: true,
    type: true,
    balance: true,
    currencyCode: true,
    creditLimit: true,
    billingDay: true,
    dueDay: true,
    excludeFromStats: true,
    archived: true,
    sortOrder: true,
  })
  .partial()
  .extend({
    id: z.uuid(),
  })

export const accountResponseSchema = accountSchema

export const accountListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  name: z.string().optional(),
})

export const accountPageResponseSchema = pageResponseSchema(accountResponseSchema)

export type Account = z.infer<typeof accountSchema>
export type CreateAccount = z.infer<typeof createAccountSchema>
export type UpdateAccount = z.infer<typeof updateAccountSchema>
