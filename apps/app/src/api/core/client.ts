// Core Layer: Client Strategy (Browser)
// Uses browser fetch and Zustand store for auth token.

import { useUser } from "@/stores/useUser"
import type { RequestFn } from "./types"

export const clientRequest: RequestFn = async (url, config = {}) => {
  const token = useUser.getState().token
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

  const response = await fetch(url, {
    ...config,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      useUser.getState().reset()
      // Optional: Redirect to login if needed
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
         // window.location.href = "/login" 
      }
    }
    const errorBody = await response.text()
    throw new Error(errorBody || `Client Request Failed: ${response.statusText}`)
  }

  // Handle empty response body (e.g. 204 No Content)
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}
