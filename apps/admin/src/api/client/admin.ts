import { useUser } from "@/stores/useUser"
import { FetchInstance, withHeader } from "./core"

function getToken(): string {
  if (typeof window === "undefined") return ""
  return useUser.getState().token ?? ""
}

function clearToken() {
  if (typeof window === "undefined") return
  useUser.getState().reset()
}

export const api = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "",
  timeout: 60000,
  retries: 0,
})

api.addRequestInterceptor(({ url, options }) => {
  const token = getToken()
  let headers = options.headers
  if (token) {
    headers = withHeader(headers, "Authorization", `Bearer ${token}`)
  }
  return { url, options: { ...options, headers } }
})

api.addResponseInterceptor((response) => {
  if (response.status === 401 || response.status === 403) {
    clearToken()
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login")
    }
  }
  return response
})
