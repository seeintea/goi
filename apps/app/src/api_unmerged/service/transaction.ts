import type {
  CreateTransaction,
  PageResult,
  Transaction,
  transactionListQuerySchema,
  UpdateTransaction,
} from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
export type { CreateTransaction, Transaction, UpdateTransaction }

const createTransactionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateTransaction
  return await serverFetch<Transaction>("/api/transactions/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createTransaction = createTransactionFnBase as unknown as (ctx: {
  data: CreateTransaction
}) => Promise<Transaction>

const findTransactionFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Transaction>(`/api/transactions/find?${params}`, {
    method: "GET",
  })
})

export const findTransaction = findTransactionFnBase as unknown as (ctx: { data: string }) => Promise<Transaction>

const listTransactionsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as TransactionListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Transaction>>(`/api/transactions/list?${params}`, {
    method: "GET",
  })
})

export const listTransactions = listTransactionsFnBase as unknown as (ctx: {
  data: TransactionListQuery | undefined
}) => Promise<PageResult<Transaction>>

const updateTransactionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateTransaction
  return await serverFetch<Transaction>("/api/transactions/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateTransaction = updateTransactionFnBase as unknown as (ctx: {
  data: UpdateTransaction
}) => Promise<Transaction>

const deleteTransactionFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/transactions/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteTransaction = deleteTransactionFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
