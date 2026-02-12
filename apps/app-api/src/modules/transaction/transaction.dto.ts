import {
  CreateTransaction,
  createTransactionSchema,
  Transaction,
  transactionListQuerySchema,
  transactionPageResponseSchema,
  transactionResponseSchema,
  UpdateTransaction,
  updateTransactionSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedTransactionResponseSchema = transactionResponseSchema as z.ZodType<Transaction>
const typedCreateTransactionSchema = createTransactionSchema as z.ZodType<CreateTransaction>
const typedUpdateTransactionSchema = updateTransactionSchema as z.ZodType<UpdateTransaction>

export class TransactionResponseDto extends createZodDto(typedTransactionResponseSchema) {}
export class CreateTransactionDto extends createZodDto(typedCreateTransactionSchema) {}
export class UpdateTransactionDto extends createZodDto(typedUpdateTransactionSchema) {}
export class TransactionListQueryDto extends createZodDto(transactionListQuerySchema) {}
export class TransactionPageResponseDto extends createZodDto(transactionPageResponseSchema) {}
