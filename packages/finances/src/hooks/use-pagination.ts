import { useEffect, useMemo, useState } from "react"

export type PaginationConfig = {
  total: number
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
  resetPageOnPageSizeChange?: boolean
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
  total,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions,
  resetPageOnPageSizeChange = true,
}: PaginationConfig) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize))
  }, [pageSize, total])

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const pagination = useMemo<PaginationState>(() => {
    return {
      page,
      pageSize,
      total,
      onPageChange: setPage,
      onPageSizeChange: (nextPageSize) => {
        setPageSize(nextPageSize)
        if (resetPageOnPageSizeChange) {
          setPage(1)
        }
      },
      pageSizeOptions,
    }
  }, [page, pageSize, pageSizeOptions, resetPageOnPageSizeChange, total])

  return {
    page,
    pageSize,
    pageCount,
    setPage,
    setPageSize,
    pagination,
  }
}

