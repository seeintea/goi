import type { Budget, budgetListQuerySchema, CreateBudget, PageResult, UpdateBudget } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type BudgetListQuery = z.infer<typeof budgetListQuerySchema>
export type { Budget, CreateBudget, UpdateBudget }

const createBudgetFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateBudget
  return await serverFetch<Budget>("/api/budgets/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createBudget = createBudgetFnBase as unknown as (ctx: { data: CreateBudget }) => Promise<Budget>

const findBudgetFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Budget>(`/api/budgets/find?${params}`, {
    method: "GET",
  })
})

export const findBudget = findBudgetFnBase as unknown as (ctx: { data: string }) => Promise<Budget>

const listBudgetsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as BudgetListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Budget>>(`/api/budgets/list?${params}`, {
    method: "GET",
  })
})

export const listBudgets = listBudgetsFnBase as unknown as (ctx: {
  data: BudgetListQuery | undefined
}) => Promise<PageResult<Budget>>

const updateBudgetFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateBudget
  return await serverFetch<Budget>("/api/budgets/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateBudget = updateBudgetFnBase as unknown as (ctx: { data: UpdateBudget }) => Promise<Budget>

const deleteBudgetFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/budgets/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteBudget = deleteBudgetFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
