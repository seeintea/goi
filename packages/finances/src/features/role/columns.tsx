import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Pencil } from "lucide-react"

import type { Role } from "@/api/controllers/role"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"

export function getRoleColumns({
  onEdit,
  onToggleDisabled,
  onDelete,
}: {
  onEdit: (role: Role) => void
  onToggleDisabled: (role: Role) => void
  onDelete: (role: Role) => void | Promise<void>
}): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "roleId",
      header: "角色ID",
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.getValue<string>("roleId") || "-"}</span>
      },
    },
    {
      accessorKey: "roleCode",
      header: "角色编码",
      cell: ({ row }) => {
        return row.getValue<string>("roleCode") || "-"
      },
    },
    {
      accessorKey: "roleName",
      header: "角色名称",
      cell: ({ row }) => {
        return row.getValue<string>("roleName") || "-"
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
        const role = row.original
        const nextDisabled = !role.isDisabled
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(role)}
            >
              <Pencil />
              编辑
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleDisabled(role)}
            >
              {nextDisabled ? "禁用" : "启用"}
            </Button>

            <ConfirmDialog
              title="确认删除？"
              description={`确定删除角色 ${role.roleName || role.roleCode} 吗？此操作不可恢复。`}
              onConfirm={() => onDelete(role)}
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
