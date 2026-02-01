import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PackageOpen } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableSearch = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

type DataTablePagination = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  emptyText?: string
  search?: DataTableSearch
  pagination?: DataTablePagination
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyText = "暂无数据",
  search,
  pagination,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageJump, setPageJump] = useState("")

  const pageCount = useMemo(() => {
    if (!pagination) return 0
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
  }, [pagination])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const currentPage = pagination?.page ?? 1
  const canPrev = pagination ? currentPage > 1 : false
  const canNext = pagination ? currentPage < pageCount : false
  const pages = useMemo(() => {
    if (!pagination) return []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1
    if (end > pageCount) {
      end = pageCount
      start = Math.max(1, end - maxVisible + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx)
  }, [currentPage, pageCount, pagination])

  const commitPageJump = (raw: string) => {
    if (!pagination) return
    const next = Number(raw)
    if (!Number.isFinite(next)) return
    const clamped = Math.min(pageCount, Math.max(1, Math.trunc(next)))
    pagination.onPageChange(clamped)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {search && (
        <div className="flex items-center justify-between gap-2">
          <div className="w-full max-w-sm">
            <Input
              value={search.value}
              onChange={(e) => search.onValueChange(e.target.value)}
              placeholder={search.placeholder ?? "搜索..."}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.isPlaceholder) return <TableHead key={header.id} />

                  const headerDef = header.column.columnDef.header
                  const canSort = header.column.getCanSort()

                  return (
                    <TableHead key={header.id}>
                      {typeof headerDef === "string" && canSort ? (
                        <Button
                          variant="ghost"
                          className="-ml-2 h-8 px-2"
                          onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                        >
                          <span>{headerDef}</span>
                          <ArrowUpDown className="ml-2 size-4" />
                        </Button>
                      ) : (
                        flexRender(headerDef, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">加载中...</div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2 p-6">
                    <PackageOpen className="text-muted-foreground size-9" />
                    <div className="text-muted-foreground text-sm">{emptyText}</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center gap-3 overflow-x-auto py-2">
          <div className="flex items-center gap-3 text-muted-foreground text-sm whitespace-nowrap">
            <div>共 {pagination.total} 条</div>
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-2">
                <div>每页</div>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
                >
                  <SelectTrigger size="sm">
                    <SelectValue placeholder={String(pagination.pageSize)} />
                  </SelectTrigger>
                  <SelectContent>
                    {(pagination.pageSizeOptions ?? [10, 20, 50, 100]).map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              {pagination.page}/{pageCount} 页
            </div>
          </div>

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

          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="text-muted-foreground text-sm">跳转</div>
            <Input
              inputMode="numeric"
              value={pageJump}
              onChange={(e) => setPageJump(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitPageJump(pageJump)
                }
              }}
              onBlur={() => commitPageJump(pageJump)}
              placeholder={String(currentPage)}
              className="w-16"
            />
          </div>
        </div>
      )}
    </div>
  )
}
