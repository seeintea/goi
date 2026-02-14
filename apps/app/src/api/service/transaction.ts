import type { CreateTransaction, Transaction, transactionListQuerySchema, UpdateTransaction } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client-csr"
import type { PageResult } from "@/types/api"

export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
export type { CreateTransaction, Transaction, UpdateTransaction }

export const createTransaction = (body: CreateTransaction) => api.post<Transaction>("/api/transactions/create", body)

export const findTransaction = (id: string) => api.get<Transaction>("/api/transactions/find", { id })

export const listTransactions = (query?: TransactionListQuery) =>
  api.get<PageResult<Transaction>>("/api/transactions/list", query)

export const updateTransaction = (body: UpdateTransaction) => api.post<Transaction>("/api/transactions/update", body)

export const deleteTransaction = (id: string) => api.post<boolean>("/api/transactions/delete", { id })
