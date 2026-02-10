import { useEffect, useMemo, useState } from "react"

export type PaginationConfig = {
  initialTotal?: number
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
  resetPageOnPageSizeChange?: boolean
  clampPageOnTotalChange?: boolean
  enablePageSizeChange?: boolean
}

export type PaginationState = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function usePagination({
  initialTotal,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions,
  resetPageOnPageSizeChange = true,
  clampPageOnTotalChange = true,
  enablePageSizeChange = true,
}: PaginationConfig) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [total, setTotal] = useState(initialTotal ?? 0)
  const [isTotalKnown, setIsTotalKnown] = useState(initialTotal !== undefined)

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize))
  }, [pageSize, total])

  useEffect(() => {
    if (!clampPageOnTotalChange) return
    if (!isTotalKnown) return
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [clampPageOnTotalChange, isTotalKnown, page, pageCount])

  const pagination = useMemo<PaginationState>(() => {
    return {
      page,
      pageSize,
      total,
      onPageChange: setPage,
      onPageSizeChange: enablePageSizeChange
        ? (nextPageSize) => {
            setPageSize(nextPageSize)
            if (resetPageOnPageSizeChange) {
              setPage(1)
            }
          }
        : undefined,
      pageSizeOptions,
    }
  }, [enablePageSizeChange, page, pageSize, pageSizeOptions, resetPageOnPageSizeChange, total])

  return {
    page,
    pageSize,
    pageCount,
    setPage,
    setPageSize,
    total,
    setTotal: (nextTotal: number) => {
      setIsTotalKnown(true)
      setTotal(nextTotal)
    },
    pagination,
  }
}
