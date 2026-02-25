// Core Layer: Server Strategy (Node.js)
// Uses Node fetch and Cookie Session for auth.

import type { ApiResponse } from "@goi/contracts"
import { FetchInstance, stringifyUrl } from "@goi/utils-web"
import { redirect } from "@tanstack/react-router"
import { getAppSession } from "@/utils/server/session.server"
import type { RequestConfig, RequestFn } from "./types"

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

export const serverRequest: RequestFn = async <T>(url: string, config: RequestConfig = {}) => {
  const { params, body, ...options } = config
  const session = await getAppSession()
  const token = session.data?.accessToken

  let fullUrl = url
  if (params) {
    fullUrl = stringifyUrl(url, params)
  }

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let requestBody = body as BodyInit | null | undefined

  // Ensure Content-Type is set for JSON bodies
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams)
  ) {
    requestBody = JSON.stringify(body)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
  } else if (typeof body === "string") {
    // If body is already string, check if it's JSON to set header
    requestBody = body
    if (!headers.has("Content-Type")) {
      try {
        JSON.parse(body)
        headers.set("Content-Type", "application/json")
      } catch {
        // not json, ignore
      }
    }
  } else {
    requestBody = body as BodyInit
  }

  const response = await http.request<ApiResponse<T>>(fullUrl, { ...options, headers, body: requestBody })
  if (response.code === 200) {
    return response.data
  }
  throw new Error(response.message || "请求失败")
}
