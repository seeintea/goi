import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Pencil } from "lucide-react"

import type { Permission } from "@/api/controllers/permission"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"

export function getPermissionColumns({
  isBusy,
  moduleLabelById,
  onEdit,
  onToggleDisabled,
  onDelete,
}: {
  isBusy: boolean
  moduleLabelById: Record<string, string>
  onEdit: (permission: Permission) => void
  onToggleDisabled: (permission: Permission) => void
  onDelete: (permission: Permission) => void | Promise<void>
}): ColumnDef<Permission>[] {
  return [
    {
      accessorKey: "permissionId",
      header: "权限ID",
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.getValue<string>("permissionId") || "-"}</span>
      },
    },
    {
      accessorKey: "code",
      header: "权限编码",
      cell: ({ row }) => {
        return row.getValue<string>("code") || "-"
      },
    },
    {
      accessorKey: "name",
      header: "权限名称",
      cell: ({ row }) => {
        return row.getValue<string>("name") || "-"
      },
    },
    {
      accessorKey: "moduleId",
      header: "模块",
      cell: ({ row }) => {
        const moduleId = row.getValue<string>("moduleId")
        if (!moduleId) return "-"
        return moduleLabelById[moduleId] || moduleId
      },
    },
    {
      accessorKey: "isDisabled",
      header: "状态",
      cell: ({ row }) => {
        return row.original.isDisabled ? (
          <span className="text-destructive text-sm">禁用</span>
        ) : (
          <span className="text-sm">正常</span>
        )
      },
    },
    {
      accessorKey: "createTime",
      header: "创建时间",
      cell: ({ row }) => {
        const createTime = row.getValue<string>("createTime")
        if (createTime) {
          return format(new Date(createTime), "yyyy-MM-dd HH:mm:ss")
        }
        return "-"
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const permission = row.original
        const nextDisabled = !permission.isDisabled
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onEdit(permission)}
            >
              <Pencil />
              编辑
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onToggleDisabled(permission)}
            >
              {nextDisabled ? "禁用" : "启用"}
            </Button>

            <ConfirmDialog
              title="确认删除？"
              description={`确定删除权限 ${permission.name || permission.code} 吗？此操作不可恢复。`}
              onConfirm={() => onDelete(permission)}
              disabled={isBusy}
              trigger={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBusy}
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
