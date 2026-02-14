import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type AccountListQuery,
  type CreateAccount,
  createAccount,
  deleteAccount,
  findAccount,
  listAccounts,
  type UpdateAccount,
  updateAccount,
} from "../service/account"

export const accountKeys = {
  all: ["account"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (query?: AccountListQuery) => [...accountKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...accountKeys.all, "find", id] as const,
}

export const accountListOptions = (query?: AccountListQuery) =>
  queryOptions({
    queryKey: accountKeys.list(query),
    queryFn: () => listAccounts({ data: query }),
  })

export const accountOptions = (id: string) =>
  queryOptions({
    queryKey: accountKeys.find(id),
    queryFn: () => findAccount({ data: id }),
    enabled: Boolean(id),
  })

export function useAccountList(query?: AccountListQuery) {
  return useQuery(accountListOptions(query))
}

export function useAccount(id: string) {
  return useQuery(accountOptions(id))
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAccount) => {
      const res = await createAccount({ data: body })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateAccount) => {
      const res = await updateAccount({ data: body })
      return res
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: accountKeys.find(data.id) })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteAccount({ data: id })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}
