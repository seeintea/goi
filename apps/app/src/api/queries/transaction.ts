import {
  type CreateTransaction,
  type TransactionListQuery,
  type UpdateTransaction,
  createTransaction,
  deleteTransaction,
  findTransaction,
  listTransactions,
  updateTransaction,
} from "../service/transaction"
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const transactionKeys = {
  all: ["transaction"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (query?: TransactionListQuery) => [...transactionKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...transactionKeys.all, "find", id] as const,
}

export const transactionListOptions = (query?: TransactionListQuery) =>
  queryOptions({
    queryKey: transactionKeys.list(query),
    queryFn: () => listTransactions(query),
  })

export const transactionOptions = (id: string) =>
  queryOptions({
    queryKey: transactionKeys.find(id),
    queryFn: () => findTransaction(id),
    enabled: Boolean(id),
  })

export function useTransactionList(query?: TransactionListQuery) {
  return useQuery(transactionListOptions(query))
}

export function useTransaction(id: string) {
  return useQuery(transactionOptions(id))
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateTransaction) => {
      const res = await createTransaction(body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateTransaction) => {
      const res = await updateTransaction(body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.find(data.id) })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteTransaction(id)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}
