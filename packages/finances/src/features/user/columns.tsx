import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import type { User } from "@/api/controllers/user"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"

export function getUserColumns({
  isBusy,
  onToggleDisabled,
  onDelete,
}: {
  isBusy: boolean
  onToggleDisabled: (user: User) => void
  onDelete: (user: User) => void | Promise<void>
}): ColumnDef<User>[] {
  return [
    {
      accessorKey: "userId",
      header: "用户ID",
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.getValue<string>("userId") || "-"}</span>
      },
    },
    {
      accessorKey: "username",
      header: "用户名",
      cell: ({ row }) => {
        return row.getValue<string>("username") || "-"
      },
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => {
        return row.getValue<string>("email") || "-"
      },
    },
    {
      accessorKey: "phone",
      header: "手机",
      cell: ({ row }) => {
        return row.getValue<string>("phone") || "-"
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
        const user = row.original
        const nextDisabled = !user.isDisabled
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onToggleDisabled(user)}
            >
              {nextDisabled ? "禁用" : "启用"}
            </Button>

            <ConfirmDialog
              title="确认删除？"
              description={`确定删除用户 ${user.username} 吗？此操作不可恢复。`}
              onConfirm={() => onDelete(user)}
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
