import type { CreateFamily, Family, familyListQuerySchema, PageResult, UpdateFamily } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type FamilyListQuery = z.infer<typeof familyListQuerySchema>
export type { CreateFamily, Family, UpdateFamily }

const createFamilyFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateFamily
  return await serverFetch<Family>("/api/families/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createFamily = createFamilyFnBase as unknown as (ctx: { data: CreateFamily }) => Promise<Family>

const findFamilyFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  const params = new URLSearchParams({ id })
  return await serverFetch<Family>(`/api/families/find?${params}`, {
    method: "GET",
  })
})

export const findFamily = findFamilyFnBase as unknown as (ctx: { data: string }) => Promise<Family>

const listFamiliesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as FamilyListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<Family>>(`/api/families/list?${params}`, {
    method: "GET",
  })
})

export const listFamilies = listFamiliesFnBase as unknown as (ctx: {
  data: FamilyListQuery | undefined
}) => Promise<PageResult<Family>>

const updateFamilyFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateFamily
  return await serverFetch<Family>("/api/families/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateFamily = updateFamilyFnBase as unknown as (ctx: { data: UpdateFamily }) => Promise<Family>

const deleteFamilyFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<boolean>("/api/families/delete", {
    method: "POST",
    body: { id } as unknown as BodyInit,
  })
})

export const deleteFamily = deleteFamilyFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
