// Core Layer: Server Strategy (Node.js)
// Uses Node fetch and Cookie Session for auth.

import { FetchInstance } from "@goi/utils-web"
import { redirect } from "@tanstack/react-router"
import { getAppSession } from "@/utils/server/session.server"
import type { RequestFn } from "./types"

const http = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000",
  timeout: 30000,
})

http.addResponseInterceptor((response) => {
  if (response.status === 401) {
    getAppSession().then((session) => {
      session.clear()
    })
    throw redirect({ to: "/login" })
  }
  return response
})

// Note: FetchInstance request interceptors are synchronous, so we handle async session retrieval in the wrapper below.

export const serverRequest: RequestFn = async (url, options: RequestInit = {}) => {
  const session = await getAppSession()
  const token = session.data?.accessToken

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Ensure Content-Type is set for JSON bodies
  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof URLSearchParams)
  ) {
    options.body = JSON.stringify(options.body)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
  }

  // Ensure Content-Type is set for JSON string bodies if not already set
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    try {
      JSON.parse(options.body)
      headers.set("Content-Type", "application/json")
    } catch {
      // not json, ignore
    }
  }

  return await http.request(url, { ...options, headers })
}
