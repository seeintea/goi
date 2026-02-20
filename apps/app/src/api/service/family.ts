import type { CreateFamily, Family, FamilyMember, PageQuery, PageResult, UpdateFamily } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

const createFamilyFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateFamily
  if (!data) {
    throw new Error("Invalid input")
  }

  try {
    const res = await serverFetch<Family>("/api/families/create", {
      method: "POST",
      body: data as unknown as BodyInit,
    })
    return res
  } catch (error) {
    console.error("Create family error:", error)
    throw error
  }
})

export const createFamily = createFamilyFnBase as unknown as (ctx: { data: CreateFamily }) => Promise<Family>

const listFamiliesFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as PageQuery & { name?: string }
  const params = new URLSearchParams()
  if (query) {
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
  data: PageQuery & { name?: string }
}) => Promise<PageResult<Family>>

const findFamilyFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const id = ctx.data as string
  return await serverFetch<Family>(`/api/families/find?id=${id}`, {
    method: "GET",
  })
})

export const findFamily = findFamilyFnBase as unknown as (ctx: { data: string }) => Promise<Family>

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

const bindFamilyFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as { familyId: string }
  if (!data || !data.familyId) {
    throw new Error("Invalid input")
  }

  try {
    // Dynamic import to avoid bundling server code on client
    const { getAppSession } = await import("@/lib/server/session.server")
    const session = await getAppSession()
    const userId = session.data?.userId
    if (!userId) {
      throw new Error("用户未登录")
    }

    // 1. Get role ID for 'member' role
    // We fetch roles with code 'member' and find the one matching our familyId
    const rolesRes = await serverFetch<{ list: Array<{ roleId: string; roleCode: string; familyId?: string | null }> }>(
      "/api/sys/role/list?roleCode=member&pageSize=100",
      {
        method: "GET",
      },
    )

    const memberRole = rolesRes.list.find((r) => r.familyId === data.familyId)

    if (!memberRole) {
      throw new Error("未找到该家庭的成员角色")
    }

    const res = await serverFetch<FamilyMember>("/api/family-members/create", {
      method: "POST",
      body: {
        familyId: data.familyId,
        userId,
        roleId: memberRole.roleId,
        status: "active",
      } as unknown as BodyInit,
    })
    return res
  } catch (error) {
    console.error("Bind family error:", error)
    throw error
  }
})

export const bindFamily = bindFamilyFnBase as unknown as (ctx: { data: { familyId: string } }) => Promise<FamilyMember>
