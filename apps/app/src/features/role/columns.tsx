import type { AppRole } from "@goi/contracts"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ConfirmDialog } from "@/components/base/confirm-dialog"
import { Button } from "@/components/ui/button"

export type RoleActions = {
  onEdit: (role: AppRole) => void
  onDelete: (role: AppRole) => void
}

export function getRoleColumns({ onEdit, onDelete }: RoleActions): ColumnDef<AppRole>[] {
  return [
    {
      accessorKey: "roleId",
      header: "ID",
      cell: ({ row }) => (
        <div
          className="max-w-25 truncate font-mono text-xs"
          title={row.getValue("roleId")}
        >
          {row.getValue("roleId")}
        </div>
      ),
    },
    {
      accessorKey: "roleCode",
      header: "角色编码",
    },
    {
      accessorKey: "roleName",
      header: "角色名称",
    },
    {
      accessorKey: "isDisabled",
      header: "状态",
      cell: ({ row }) => {
        const isDisabled = row.getValue("isDisabled")
        return <div className={isDisabled ? "text-destructive" : "text-green-600"}>{isDisabled ? "禁用" : "正常"}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => {
        const date = row.getValue<string>("createdAt")
        return date ? format(new Date(date), "yyyy-MM-dd HH:mm") : "-"
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(role)}
            >
              编辑
            </Button>
            <ConfirmDialog
              title="删除角色"
              description={`确定要删除角色 "${role.roleName}" 吗？此操作不可恢复。`}
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
