import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowUpDown, PackageOpen } from "lucide-react"
import { useState } from "react"

import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
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
  pagination,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

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

  return (
    <div className={cn("flex flex-col gap-3", className)}>
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

      {pagination && <Pagination pagination={pagination} />}
    </div>
  )
}
