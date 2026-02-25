import type { Login, LoginResponse, NavMenuTree } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { createAuthApi } from "../common/auth"
import { serverRequest } from "../core/server"

const api = createAuthApi(serverRequest)

const loginFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as Login
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  const payload = data

  try {
    const resp = await api.login(payload)

    // Dynamic import to avoid bundling server code on client
    const { getAppSession } = await import("@/utils/server/session.server")
    const session = await getAppSession()

    await session.update(resp)

    return resp
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: (error as Error).message || "登录服务异常",
    }
  }
})

export const loginFn = loginFnBase as unknown as (ctx: { data: Login }) => Promise<LoginResponse>

export const logoutFn = createServerFn({ method: "POST" }).handler(async (): Promise<boolean> => {
  try {
    // 1. Call Backend API (optional, but good practice)
    await api.logout()
  } catch (e) {
    // Ignore backend logout errors, proceed to clear local session
    console.error("Backend logout failed:", e)
  }

  // 2. Clear Session Cookie
  const { getAppSession } = await import("@/utils/server/session.server")
  const session = await getAppSession()
  await session.clear()

  return true
})

export const getAuthUserFn = createServerFn({ method: "GET" }).handler(async (): Promise<LoginResponse | undefined> => {
  try {
    // In server context, we might need to handle token extraction differently
    // if not handled by serverRequest automatically from session.
    // But serverRequest implementation uses getAppSession() which is correct.

    // We need to construct the full LoginResponse.
    // The /me endpoint returns user info without token.
    // The token is in the session.
    const { getAppSession } = await import("@/utils/server/session.server")
    const session = await getAppSession()
    const accessToken = session.data?.accessToken

    if (!accessToken) return undefined
    const user = await api.getMe()
    return { ...user, accessToken }
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return undefined
  }
})

export const getNavFn = createServerFn({ method: "GET" }).handler(async (): Promise<NavMenuTree[]> => {
  try {
    return await api.getNav()
  } catch (error) {
    console.error("Get nav error:", error)
    return []
  }
})

export const getPermissionsFn = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  try {
    return await api.getPermissions()
  } catch (error) {
    console.error("Get permissions error:", error)
    return []
  }
})
