import type { AppUser } from "@goi/contracts"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ConfirmDialog } from "@/components/base/confirm-dialog"
import { Button } from "@/components/ui/button"

export type UserActions = {
  currentUserId: string
  onEdit: (user: AppUser) => void
  onResetPassword: (user: AppUser) => void
  onExitFamily: (user: AppUser) => void
  onRemoveFromFamily: (user: AppUser) => void
}

export function getUserColumns({
  currentUserId,
  onEdit,
  onResetPassword,
  onExitFamily,
  onRemoveFromFamily,
}: UserActions): ColumnDef<AppUser>[] {
  return [
    {
      accessorKey: "userId",
      header: "ID",
      cell: ({ row }) => (
        <div
          className="max-w-[100px] truncate font-mono text-xs"
          title={row.getValue("userId")}
        >
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
      accessorKey: "isVirtual",
      header: "虚拟账户",
      cell: ({ row }) => {
        const isVirtual = row.getValue("isVirtual")
        return isVirtual ? "是" : "否"
      },
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
        const user = row.original
        const isSelf = user.userId === currentUserId
        const isVirtual = user.isVirtual

        return (
          <div className="flex items-center gap-2">
            {(isSelf || isVirtual) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResetPassword(user)}
                >
                  重置密码
                </Button>
              </>
            )}

            {isSelf && (
              <ConfirmDialog
                title="退出家庭"
                description="确定要退出当前家庭吗？"
                onConfirm={() => onExitFamily(user)}
                trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    退出家庭
                  </Button>
                }
              />
            )}

            {!isSelf && (
              <ConfirmDialog
                title="移出家庭"
                description={`确定要将用户 "${user.username}" 移出家庭吗？`}
                onConfirm={() => onRemoveFromFamily(user)}
                trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    移出家庭
                  </Button>
                }
              />
            )}
          </div>
        )
      },
    },
  ]
}
