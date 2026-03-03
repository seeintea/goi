import type { AppUser } from "@goi/contracts"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ConfirmDialog } from "@/components/base/confirm-dialog"
import { Button } from "@/components/ui/button"

export type UserActions = {
  onEdit: (user: AppUser) => void
  onDelete: (user: AppUser) => void
  onToggleStatus: (user: AppUser) => void
}

export function getUserColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: UserActions): ColumnDef<AppUser>[] {
  return [
    {
      accessorKey: "userId",
      header: "ID",
      cell: ({ row }) => (
        <div className="max-w-[100px] truncate font-mono text-xs" title={row.getValue("userId")}>
          {row.getValue("userId")}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "用户名",
    },
    {
      accessorKey: "nickname",
      header: "昵称",
      cell: ({ row }) => row.getValue("nickname") || "-",
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "phone",
      header: "手机",
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "isDisabled",
      header: "状态",
      cell: ({ row }) => {
        const isDisabled = row.getValue("isDisabled")
        return (
          <div className={isDisabled ? "text-destructive" : "text-green-600"}>
            {isDisabled ? "禁用" : "正常"}
          </div>
        )
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
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
            >
              编辑
            </Button>
            <Button
              variant={user.isDisabled ? "outline" : "secondary"}
              size="sm"
              onClick={() => onToggleStatus(user)}
            >
              {user.isDisabled ? "启用" : "禁用"}
            </Button>
            <ConfirmDialog
              title="确认删除"
              description={`确定要删除用户 "${user.username}" 吗？此操作不可恢复。`}
              onConfirm={() => onDelete(user)}
              trigger={
                <Button variant="destructive" size="sm">
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
