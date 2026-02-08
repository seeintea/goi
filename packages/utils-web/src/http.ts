export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export type RequestContext = { url: string; options: RequestInit }
export type RequestInterceptor = (ctx: RequestContext) => RequestContext
export type ResponseInterceptor = (response: Response) => Response

export function removeNullish(input?: Record<string, unknown>): Record<string, string> {
  if (!input) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue
    if (typeof value === "string") {
      if (value.length === 0) continue
      out[key] = value
      continue
    }
    if (typeof value === "number" || typeof value === "boolean") {
      out[key] = String(value)
      continue
    }
    out[key] = JSON.stringify(value)
  }
  return out
}

export function stringifyUrl(url: string, query?: Record<string, unknown>): string {
  const realQuery = removeNullish(query)
  const search = new URLSearchParams(realQuery).toString()
  if (!search) return url
  return `${url}${url.includes("?") ? "&" : "?"}${search}`
}

export function withHeader(headers: HeadersInit | undefined, key: string, value: string): HeadersInit {
  if (!value) return headers ?? {}
  if (!headers) return { [key]: value }
  if (headers instanceof Headers) {
    const next = new Headers(headers)
    next.set(key, value)
    return next
  }
  if (Array.isArray(headers)) {
    const next = [...headers]
    next.push([key, value])
    return next
  }
  return { ...headers, [key]: value }
}

export class FetchInstance {
  private baseURL: string
  private timeout: number
  private retries: number
  private requestInterceptors: Array<RequestInterceptor> = []
  private responseInterceptors: Array<ResponseInterceptor> = []

  constructor(config: { baseURL?: string; timeout?: number; retries?: number } = {}) {
    this.baseURL = config.baseURL || ""
    this.timeout = config.timeout || 10000
    this.retries = config.retries || 0
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    let fullURL = this.baseURL ? `${this.baseURL}${url}` : url
    let mergedOptions: RequestInit = { ...options }

    for (const interceptor of this.requestInterceptors) {
      const next = interceptor({ url: fullURL, options: mergedOptions })
      fullURL = next.url
      mergedOptions = next.options
    }

    let lastError: Error = new Error("请求失败")

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        let response: Response = await fetch(fullURL, { ...mergedOptions, signal: controller.signal })

        for (const interceptor of this.responseInterceptors) {
          response = interceptor(response)
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return (await response.json()) as T
      } catch (error) {
        const e = error as Error
        if (e?.name === "AbortError") {
          lastError = new Error(`接口请求超时: ${this.timeout}ms`)
        } else {
          lastError = e
        }
        if (attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    throw lastError
  }

  get<T>(url: string, params?: Record<string, unknown>, options?: RequestInit): Promise<ApiResponse<T>> {
    const queryUrl = params ? stringifyUrl(url, params) : url
    return this.request<ApiResponse<T>>(queryUrl, { ...options, method: "GET" })
  }

  post<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers = withHeader(options?.headers, "Content-Type", "application/json")
    const body = data === undefined ? undefined : JSON.stringify(data)
    return this.request<ApiResponse<T>>(url, { ...options, method: "POST", headers, body })
  }
}
