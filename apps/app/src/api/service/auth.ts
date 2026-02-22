import type { Login, LoginResponse, NavMenuTree, Register } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type { LoginResponse }

const loginFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as Login
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  const payload = data

  try {
    const res = await serverFetch<LoginResponse>("/api/sys/auth/login", {
      method: "POST",
      body: payload as unknown as BodyInit,
    })

    // Dynamic import to avoid bundling server code on client
    const { getAppSession } = await import("@/utils/server/session.server")
    const session = await getAppSession()

    const sessionData = {
      ...res,
    }

    await session.update(sessionData)

    return {
      data: sessionData,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: (error as Error).message || "登录服务异常",
    }
  }
})

export const login = loginFnBase as unknown as (ctx: {
  data: Login
}) => Promise<{ data?: LoginResponse; error?: string }>

const registerFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as Register
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  const payload = data

  try {
    await serverFetch("/api/sys/auth/register", {
      method: "POST",
      body: payload as unknown as BodyInit,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Register error:", error)
    return {
      error: (error as Error).message || "注册服务异常",
    }
  }
})

export const register = registerFnBase as unknown as (ctx: {
  data: Register
}) => Promise<{ success?: boolean; error?: string }>

const logoutFnBase = createServerFn({ method: "POST" }).handler(async () => {
  const { getAppSession } = await import("@/utils/server/session.server")
  const session = await getAppSession()

  // Call backend logout API to clear server-side session/token
  try {
    await serverFetch("/api/sys/auth/logout", {
      method: "POST",
    })
  } catch (error) {
    // Ignore logout errors, just proceed to clear client session
    console.warn("Backend logout failed:", error)
  }

  await session.clear()
})

export const logout = logoutFnBase as unknown as () => Promise<void>

const getAuthUserFnBase = createServerFn({ method: "GET" }).handler(async () => {
  const { getAppSession } = await import("@/utils/server/session.server")
  const session = await getAppSession()
  if (!session.data?.userId) return undefined
  return session.data as LoginResponse
})

export const getAuthUser = getAuthUserFnBase as unknown as () => Promise<LoginResponse | undefined>

const getNavFnBase = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getAppSession } = await import("@/utils/server/session.server")
    const session = await getAppSession()
    if (!session.data?.accessToken) return []
    const nav = await serverFetch<NavMenuTree[]>("/api/sys/auth/nav")
    return nav
  } catch (error) {
    console.error("Get nav error:", error)
    return []
  }
})

export const getNav = getNavFnBase as unknown as () => Promise<NavMenuTree[]>

const getPermissionsFnBase = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getAppSession } = await import("@/utils/server/session.server")
    const session = await getAppSession()
    if (!session.data?.accessToken) return []
    const permissions = await serverFetch<string[]>("/api/sys/auth/permissions")
    return permissions
  } catch (error) {
    console.error("Get permissions error:", error)
    return []
  }
})

export const getPermissions = getPermissionsFnBase as unknown as () => Promise<string[]>
