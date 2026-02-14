import type { Account, accountListQuerySchema, CreateAccount, UpdateAccount } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client-csr"
import type { PageResult } from "@/types/api"

export type AccountListQuery = z.infer<typeof accountListQuerySchema>
export type { Account, CreateAccount, UpdateAccount }

export const createAccount = (body: CreateAccount) => api.post<Account>("/api/accounts/create", body)

export const findAccount = (id: string) => api.get<Account>("/api/accounts/find", { id })

export const listAccounts = (query?: AccountListQuery) => api.get<PageResult<Account>>("/api/accounts/list", query)

export const updateAccount = (body: UpdateAccount) => api.post<Account>("/api/accounts/update", body)

export const deleteAccount = (id: string) => api.post<boolean>("/api/accounts/delete", { id })
