export type { ApiResponse } from "@goi/utils-web"

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type PageQuery = {
  page?: number | string
  pageSize?: number | string
}
