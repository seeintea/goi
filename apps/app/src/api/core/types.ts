// Core Layer: Request Interface & Types
// Defines the contract for all API requests.

export type RequestConfig = Omit<RequestInit, "body"> & {
  // Add custom config here if needed
  params?: Record<string, unknown>
  body?: RequestInit["body"] | Record<string, unknown>
}

export type RequestFn = <T>(url: string, config?: RequestConfig) => Promise<T>
