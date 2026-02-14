import type { CreateFamily, Family, familyListQuerySchema, UpdateFamily } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client-csr"
import type { PageResult } from "@/types/api"

export type FamilyListQuery = z.infer<typeof familyListQuerySchema>
export type { CreateFamily, Family, UpdateFamily }

export const createFamily = (body: CreateFamily) => api.post<Family>("/api/families/create", body)

export const findFamily = (id: string) => api.get<Family>("/api/families/find", { id })

export const listFamilies = (query?: FamilyListQuery) => api.get<PageResult<Family>>("/api/families/list", query)

export const updateFamily = (body: UpdateFamily) => api.post<Family>("/api/families/update", body)

export const deleteFamily = (id: string) => api.post<boolean>("/api/families/delete", { id })
