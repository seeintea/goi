// Core Layer: Client Strategy (Browser)
// Uses browser fetch and Zustand store for auth token.

import type { ApiResponse } from "@goi/contracts"
import { FetchInstance, stringifyUrl, withHeader } from "@goi/utils-web"
import { redirect } from "@tanstack/react-router"
import { useUser } from "@/stores/useUser"
import type { RequestConfig, RequestFn } from "./types"

// Initialize the fetch instance
const http = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "",
  timeout: 30000,
})

// Request Interceptor: Add Auth Token
http.addRequestInterceptor(({ url, options }) => {
  const token = useUser.getState().token
  let headers = options.headers

  if (token) {
    headers = withHeader(headers, "Authorization", `Bearer ${token}`)
  }

  // Ensure Content-Type is set for JSON bodies
  if (options.body && typeof options.body === "string") {
    // Basic check if it's potentially JSON to add Content-Type
    // Note: FetchInstance doesn't parse body, so we assume if it's string and starts with { or [, it might be JSON
    // Or we just safely add it if missing, similar to original logic but withHeader helper makes it cleaner
    // However, FetchInstance's interceptor receives options, so we modify headers there.

    // Simple check: if body is string, assume JSON if not set?
    // Or just trust the caller set it?
    // The original code tried to parse it. Let's keep it simple or trust common usage.
    // Actually, createAuthApi and others set "Content-Type": "application/json" manually.
    // So we might not need to auto-detect here if we follow that convention.
    // But let's add it if missing for convenience if body looks like JSON.
    try {
      JSON.parse(options.body)
      headers = withHeader(headers, "Content-Type", "application/json")
    } catch {
      // ignore
    }
  }

  return { url, options: { ...options, headers } }
})

// Response Interceptor: Handle 401
http.addResponseInterceptor((response) => {
  if (response.status === 401) {
    useUser.getState().reset()
    // We cannot throw redirect() inside an interceptor easily if it's not caught by router context immediately
    // But FetchInstance returns the response, so we can check it.
    // However, FetchInstance's request method throws on !ok.
    // We can't easily intercept the *error* flow in response interceptor of FetchInstance
    // because it iterates interceptors on the response object *before* checking response.ok.
    // So we can check status here.

    throw redirect({ to: "/login" })
  }
  return response
})

export const clientRequest: RequestFn = async <T>(url: string, config: RequestConfig = {}) => {
  try {
    const { params, body, ...rest } = config
    let fullUrl = url
    let requestBody = body as BodyInit | null | undefined

    if (params) {
      fullUrl = stringifyUrl(url, params)
    }

    if (
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof URLSearchParams)
    ) {
      requestBody = JSON.stringify(body)
      rest.headers = withHeader(rest.headers, "Content-Type", "application/json")
    }

    const response = await http.request<ApiResponse<T>>(fullUrl, { ...rest, body: requestBody })
    if (response.code === 200) {
      return response.data
    }
    throw new Error(response.message || "请求失败")
  } catch (error) {
    // Handle errors specifically if needed, or rethrow
    // If 401 happened, the interceptor might have handled reset.
    // FetchInstance throws "HTTP 401..." error.

    // If we want to use TanStack Router's redirect, we should catch it here?
    // But hooks useMutation will catch it.
    console.error("clientRequest error:", error)
    throw error
  }
}
