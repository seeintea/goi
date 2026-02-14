import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000"

export type LoginResponse = {
  userId: string
  username: string
  accessToken: string
  roleId: string
  roleName: string
  bookId: string
}

type LoginInput = {
  username: string
  password: string
}

const loginFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as LoginInput
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  const payload = data

  try {
    const response = await fetch(`${BASE_URL}/api/sys/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const res = await response.json()

    if (res.code !== 200) {
      return {
        error: res.message || "登录失败",
      }
    }

    // Dynamic import to avoid bundling server code on client
    const { getAppSession } = await import("@/utils/session.server")
    const session = await getAppSession()

    // Map familyId to bookId as per requirement
    const sessionData = {
      ...res.data,
      bookId: res.data.familyId,
      token: res.data.accessToken,
    }

    await session.update(sessionData)

    // Redirect after successful login
    throw redirect({
      to: (sessionData.bookId ? "/dashboard" : "/") as any,
    })
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    console.error("Login error:", error)
    return {
      error: "登录服务异常",
    }
  }
})

export const loginFn = loginFnBase as unknown as (ctx: { data: LoginInput }) => Promise<{ error?: string }>

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { getAppSession } = await import("@/utils/session.server")
  const session = await getAppSession()
  await session.clear()
  throw redirect({
    to: "/login",
  })
})

export const authFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getAppSession } = await import("@/utils/session.server")
  const session = await getAppSession()
  if (!session.data?.userId) return undefined
  return session.data as LoginResponse
})
