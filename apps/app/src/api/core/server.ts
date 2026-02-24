// Core Layer: Server Strategy (Node.js)
// Uses Node fetch and Cookie Session for auth.

import { FetchInstance, withHeader } from "@goi/utils-web"
import { redirect } from "@tanstack/react-router"
import { getAppSession } from "@/utils/server/session.server"
import type { RequestFn } from "./types"

const http = new FetchInstance({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
})

// Note: FetchInstance request interceptors are synchronous, so we handle async session retrieval in the wrapper below.

export const serverRequest: RequestFn = async (url, config = {}) => {
  const session = await getAppSession()
  const token = session.data?.accessToken

  let headers = config.headers
  if (token) {
    headers = withHeader(headers, "Authorization", `Bearer ${token}`)
  }

  // Ensure Content-Type is set for JSON bodies
  if (config.body && typeof config.body === "string") {
    try {
      JSON.parse(config.body)
      headers = withHeader(headers, "Content-Type", "application/json")
    } catch {
      // ignore
    }
  }

  try {
    return await http.request(url, { ...config, headers })
  } catch (error) {
    const err = error as Error
    // FetchInstance throws "HTTP {status}: {statusText}"
    if (err.message.startsWith("HTTP 401")) {
      await session.clear()
      throw redirect({ to: "/login" })
    }
    throw err
  }
}
