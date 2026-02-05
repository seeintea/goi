import { useUser } from "@/stores"
import { FetchInstance, withHeader } from "./core"

function isFinanceBookOpenEndpoint(url: string): boolean {
  return url.includes("/ff/book/list") || url.includes("/ff/book/create")
}

function shouldAttachBookId(url: string): boolean {
  return url.includes("/ff/") && !isFinanceBookOpenEndpoint(url)
}

export const api = new FetchInstance({
  baseURL: import.meta.env.PUBLIC_BASE_URL || "",
  timeout: 60000,
  retries: 0,
})

api.addRequestInterceptor(({ url, options }) => {
  const { token, bookId } = useUser.getState()

  let headers = options.headers
  if (token) {
    headers = withHeader(headers, "Authorization", `Bearer ${token}`)
  }
  if (bookId && shouldAttachBookId(url)) {
    headers = withHeader(headers, "x-book-id", bookId)
  }

  return { url, options: { ...options, headers } }
})

api.addResponseInterceptor((response) => {
  if (response.status === 401 || response.status === 403) {
    useUser.getState().reset()
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login")
    }
  }
  return response
})
