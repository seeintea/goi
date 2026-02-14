import type { Budget, budgetListQuerySchema, CreateBudget, UpdateBudget } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client-csr"
import type { PageResult } from "@/types/api"

export type BudgetListQuery = z.infer<typeof budgetListQuerySchema>
export type { Budget, CreateBudget, UpdateBudget }

export const createBudget = (body: CreateBudget) => api.post<Budget>("/api/budgets/create", body)

export const findBudget = (id: string) => api.get<Budget>("/api/budgets/find", { id })

export const listBudgets = (query?: BudgetListQuery) => api.get<PageResult<Budget>>("/api/budgets/list", query)

export const updateBudget = (body: UpdateBudget) => api.post<Budget>("/api/budgets/update", body)

export const deleteBudget = (id: string) => api.post<boolean>("/api/budgets/delete", { id })
