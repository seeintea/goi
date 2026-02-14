import { FetchInstance } from "@goi/utils-web"
import { getAppSession } from "@/utils/session.server"

const fetcher = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000",
})

export async function serverFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = await getAppSession()
  const token = session.data?.token || session.data?.accessToken

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Ensure Content-Type is set for JSON bodies if not already set
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    try {
      JSON.parse(options.body)
      headers.set("Content-Type", "application/json")
    } catch (e) {
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
export type { UserSession } from "@/utils/session.server"
