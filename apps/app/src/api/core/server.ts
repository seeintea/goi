// Core Layer: Server Strategy (Node.js)
// Uses Node fetch and Cookie Session for auth.

import { getAppSession } from "@/utils/server/session.server"
import type { RequestFn } from "./types"

export const serverRequest: RequestFn = async (url, config = {}) => {
  const session = await getAppSession()
  const token = session.data?.accessToken
  
  const headers = new Headers(config.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Ensure Content-Type is set for JSON bodies
  if (config.body && typeof config.body === "string" && !headers.has("Content-Type")) {
    try {
      JSON.parse(config.body)
      headers.set("Content-Type", "application/json")
    } catch {
      // Not JSON, ignore
    }
  }

  // In Node environment, we need absolute URLs if not proxied correctly or using internal service discovery
  // Assuming relative URLs work via TanStack Start proxy or similar mechanism, 
  // but usually for SSR fetches to API server, we might need full URL.
  // For now, we assume relative URLs are handled by the framework or a global fetch polyfill with base URL.
  // If not, we might need process.env.API_BASE_URL.
  
  // Checking for base URL environment variable
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  const fullURL = url.startsWith("http") ? url : `${baseURL}${url}`

  const response = await fetch(fullURL, {
    ...config,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      await session.clear()
    }
    const errorBody = await response.text()
    throw new Error(errorBody || `Server Request Failed: ${response.statusText}`)
  }

  const text = await response.text()
  return text ? JSON.parse(text) : {}
}
