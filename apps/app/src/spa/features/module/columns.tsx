import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Pencil } from "lucide-react"

import type { Module } from "@/api"
import { ConfirmDialog } from "@/components/base/confirm-dialog"
import { Button } from "@/components/ui/button"

export function getModuleColumns({
  moduleNameById,
  onEdit,
  onDelete,
}: {
  moduleNameById: Record<string, string>
  onEdit: (module: Module) => void
  onDelete: (module: Module) => void | Promise<void>
}): ColumnDef<Module>[] {
  return [
    {
      accessorKey: "moduleId",
      header: "模块ID",
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.getValue<string>("moduleId") || "-"}</span>
      },
    },
    {
      accessorKey: "name",
      header: "模块名称",
      cell: ({ row }) => {
        return row.getValue<string>("name") || "-"
      },
    },
    {
      accessorKey: "parentId",
      header: "父模块",
      cell: ({ row }) => {
        const parentId = row.getValue<string | null>("parentId")
        if (!parentId) return "-"
        return moduleNameById[parentId] || parentId
      },
    },
    {
      accessorKey: "permissionCode",
      header: "页面权限编码",
      cell: ({ row }) => {
        return row.getValue<string>("permissionCode") || "-"
      },
    },
    {
      accessorKey: "routePath",
      header: "前端路由路径",
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.getValue<string>("routePath") || "-"}</span>
      },
    },
    {
      accessorKey: "sort",
      header: "排序",
      cell: ({ row }) => {
        const sort = row.getValue<number>("sort")
        return Number.isFinite(sort) ? sort : "-"
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => {
        const createdAt = row.getValue<string>("createdAt")
        if (createdAt) {
          return format(new Date(createdAt), "yyyy-MM-dd HH:mm:ss")
        }
        return "-"
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const module = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(module)}
            >
              <Pencil />
              编辑
            </Button>

            <ConfirmDialog
              title="确认删除？"
              description={`确定删除模块 ${module.name || module.permissionCode} 吗？此操作不可恢复。`}
              onConfirm={() => onDelete(module)}
              trigger={
                <Button
                  variant="destructive"
                  size="sm"
                >
                  删除
                </Button>
              }
            />
          </div>
        )
      },
    },
  ]
}
