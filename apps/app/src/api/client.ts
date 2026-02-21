import { FetchInstance } from "@goi/utils-web"
import { getAppSession } from "@/utils/server/session.server"

const fetcher = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000",
})

export async function serverFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = await getAppSession()
  const token = session.data?.accessToken

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Handle object body (auto stringify and set Content-Type)
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

  // FetchInstance.request returns the parsed JSON body
  const response = await fetcher.request<{ code: number; message: string; data: T }>(url, {
    ...options,
    headers,
  })

  if (response.code !== 200) {
    throw new Error(response.message || "Request failed")
  }

  return response.data
}

export { getAppSession }
export type { UserSession } from "@/utils/server/session.server"
