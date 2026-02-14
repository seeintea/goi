import type { Account, accountListQuerySchema, CreateAccount, PageResult, UpdateAccount } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type AccountListQuery = z.infer<typeof accountListQuerySchema>
export type { Account, CreateAccount, UpdateAccount }

const createAccountFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAccount
  return await serverFetch<Account>("/api/accounts/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createAccount = createAccountFnBase as unknown as (ctx: { data: CreateAccount }) => Promise<Account>

const findAccountFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Account>(`/api/accounts/find?${params}`, {
    method: "GET",
  })
})

export const findAccount = findAccountFnBase as unknown as (ctx: { data: string }) => Promise<Account>

const listAccountsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as AccountListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Account>>(`/api/accounts/list?${params}`, {
    method: "GET",
  })
})

export const listAccounts = listAccountsFnBase as unknown as (ctx: {
  data: AccountListQuery | undefined
}) => Promise<PageResult<Account>>

const updateAccountFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateAccount
  return await serverFetch<Account>("/api/accounts/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateAccount = updateAccountFnBase as unknown as (ctx: { data: UpdateAccount }) => Promise<Account>

const deleteAccountFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/accounts/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteAccount = deleteAccountFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
