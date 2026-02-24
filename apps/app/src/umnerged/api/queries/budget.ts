import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type BudgetListQuery,
  type CreateBudget,
  createBudget,
  deleteBudget,
  findBudget,
  listBudgets,
  type UpdateBudget,
  updateBudget,
} from "../service/budget"

export const budgetKeys = {
  all: ["budget"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (query?: BudgetListQuery) => [...budgetKeys.all, "list", query ?? null] as const,
  find: (id: string) => [...budgetKeys.all, "find", id] as const,
}

export const budgetListOptions = (query?: BudgetListQuery) =>
  queryOptions({
    queryKey: budgetKeys.list(query),
    queryFn: () => listBudgets({ data: query }),
  })

export const budgetOptions = (id: string) =>
  queryOptions({
    queryKey: budgetKeys.find(id),
    queryFn: () => findBudget({ data: id }),
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
      const res = await createBudget({ data: body })
      return res
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
      const res = await updateBudget({ data: body })
      return res
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
      const res = await deleteBudget({ data: id })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}
