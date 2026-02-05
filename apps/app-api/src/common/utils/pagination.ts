import type { PageQuery, PageResult } from "@/types/response"

export type PageParams = {
  page: number
  pageSize: number
  limit: number
  offset: number
}

export type PageOptions = {
  defaultPage?: number
  defaultPageSize?: number
  maxPageSize?: number
}

const toInt = (value: unknown): number | undefined => {
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : undefined
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return undefined
    return Math.trunc(num)
  }
  return undefined
}

export const normalizePage = (query: PageQuery, options: PageOptions = {}): PageParams => {
  const defaultPage = options.defaultPage ?? 1
  const defaultPageSize = options.defaultPageSize ?? 20
  const maxPageSize = options.maxPageSize ?? 100

  const rawPage = toInt(query.page)
  const rawPageSize = toInt(query.pageSize)

  const page = Math.max(1, rawPage ?? defaultPage)
  const pageSize = Math.min(maxPageSize, Math.max(1, rawPageSize ?? defaultPageSize))

  const limit = pageSize
  const offset = (page - 1) * pageSize

  return { page, pageSize, limit, offset }
}

export const toPageResult = <T>(params: Pick<PageParams, "page" | "pageSize">, total: number, list: T[]): PageResult<T> => {
  return { list, total, page: params.page, pageSize: params.pageSize }
}
