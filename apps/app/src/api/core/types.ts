// Core Layer: Request Interface & Types
// Defines the contract for all API requests.

export type RequestConfig = RequestInit & {
  // Add custom config here if needed
}

export type RequestFn = <T>(url: string, config?: RequestConfig) => Promise<T>
