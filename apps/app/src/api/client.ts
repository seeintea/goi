import { FetchInstance } from "@goi/utils-web"

// Helper to get headers with token
async function getHeaders() {
  const { getAppSession } = await import("@/utils/session.server")
  const session = await getAppSession()
  const token = session.data?.accessToken

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Server-side specific fetch wrapper
export async function serverFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000"
  const headers = await getHeaders()
  
  // Merge headers
  const finalHeaders = new Headers(headers)
  if (options.headers) {
    const optsHeaders = new Headers(options.headers)
    optsHeaders.forEach((value, key) => {
      finalHeaders.append(key, value)
    })
  }

  // Ensure body is stringified if it's an object
  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: finalHeaders,
    body,
  })

  const res = await response.json()
  
  // Standard API response handling
  if (res.code !== 200) {
    throw new Error(res.message || "Request failed")
  }
  
  return res.data as T
}

// Re-export session utilities to keep logic aggregated
export { getAppSession } from "@/utils/session.server"
export type { UserSession } from "@/utils/session.server"
