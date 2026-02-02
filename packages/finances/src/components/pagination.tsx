import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useMemo } from "react"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import type { PaginationState } from "@/hooks/use-pagination"

export function Pagination({ pagination }: { pagination: PaginationState }) {
  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
  }, [pagination.pageSize, pagination.total])

  const currentPage = pagination.page
  const canPrev = currentPage > 1
  const canNext = currentPage < pageCount

  const pages = useMemo(() => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1
    if (end > pageCount) {
      end = pageCount
      start = Math.max(1, end - maxVisible + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx)
  }, [currentPage, pageCount])

  return (
    <div className="flex items-center justify-end gap-3 overflow-x-auto py-2">
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Button
          variant="outline"
          size="icon"
          disabled={!canPrev}
          onClick={() => pagination.onPageChange(1)}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!canPrev}
          onClick={() => pagination.onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            className="min-w-8"
            onClick={() => pagination.onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          disabled={!canNext}
          onClick={() => pagination.onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!canNext}
          onClick={() => pagination.onPageChange(pageCount)}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground text-sm whitespace-nowrap">
        <div>共 {pagination.total} 条</div>
        {pagination.onPageSizeChange && (
          <div className="flex items-center gap-2">
            <div>每页</div>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
              options={(pagination.pageSizeOptions ?? [10, 20, 50, 100]).map((size) => ({
                label: String(size),
                value: size,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
