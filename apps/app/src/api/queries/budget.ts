import {
  type BudgetListQuery,
  type CreateBudget,
  type UpdateBudget,
  createBudget,
  deleteBudget,
  findBudget,
  listBudgets,
  updateBudget,
} from "../service/budget"
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const budgetKeys = {
  all: ["budget"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (query?: BudgetListQuery) => [...budgetKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...budgetKeys.all, "find", id] as const,
}

export const budgetListOptions = (query?: BudgetListQuery) =>
  queryOptions({
    queryKey: budgetKeys.list(query),
    queryFn: () => listBudgets(query),
  })

export const budgetOptions = (id: string) =>
  queryOptions({
    queryKey: budgetKeys.find(id),
    queryFn: () => findBudget(id),
    enabled: Boolean(id),
  })

export function useBudgetList(query?: BudgetListQuery) {
  return useQuery(budgetListOptions(query))
}

export function useBudget(id: string) {
  return useQuery(budgetOptions(id))
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateBudget) => {
      const res = await createBudget(body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateBudget) => {
      const res = await updateBudget(body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.find(data.id) })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBudget(id)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}
