import type { CreateFamily, Family, FamilyMember } from "@goi/contracts"
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
    return { data: res }
  } catch (error) {
    console.error("Create family error:", error)
    return { error: (error as Error).message || "创建失败" }
  }
})

export const createFamilyFn = createFamilyFnBase as unknown as (ctx: {
  data: CreateFamily
}) => Promise<{ data?: Family; error?: string }>

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
      return { error: "用户未登录" }
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
      return { error: "未找到该家庭的成员角色" }
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
    return { data: res }
  } catch (error) {
    console.error("Bind family error:", error)
    return { error: (error as Error).message || "绑定失败" }
  }
})

export const bindFamilyFn = bindFamilyFnBase as unknown as (ctx: {
  data: { familyId: string }
}) => Promise<{ data?: FamilyMember; error?: string }>
