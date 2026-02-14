import type { Login, LoginResponse, Register } from "@goi/contracts"
import { redirect } from "@tanstack/react-router"
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
    const { getAppSession } = await import("@/utils/session.server")
    const session = await getAppSession()

    // Map familyId to bookId as per requirement
    const sessionData = {
      ...res,
      bookId: (res as any).familyId, // serverFetch returns data directly, but we need to check if familyId is in the response. Assuming serverFetch returns T (res.data)
      token: res.accessToken,
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
}) => Promise<{ data?: LoginResponse & { bookId: string }; error?: string }>

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
  const { getAppSession } = await import("@/utils/session.server")
  const session = await getAppSession()
  await session.clear()
  throw redirect({
    to: "/login",
  })
})

export const logout = logoutFnBase as unknown as () => Promise<void>

const getAuthUserFnBase = createServerFn({ method: "GET" }).handler(async () => {
  const { getAppSession } = await import("@/utils/session.server")
  const session = await getAppSession()
  if (!session.data?.userId) return undefined
  return session.data as LoginResponse
})

export const getAuthUser = getAuthUserFnBase as unknown as () => Promise<LoginResponse | undefined>
