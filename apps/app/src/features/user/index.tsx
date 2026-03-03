import type { AppUser } from "@goi/contracts"
import { useCallback, useMemo, useState } from "react"

import { useDeleteUser, useUserList } from "@/api/queries/user"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { getUserColumns } from "./columns"
import { CreateUserDialog } from "./components/create-dialog"
import { InviteUserDialog } from "./components/invite-dialog"
import { UpdateUserDialog } from "./components/update-dialog"

export function User() {
  const pagination = usePagination({})
  const { data, isLoading } = useUserList({
    page: pagination.page,
    pageSize: pagination.pageSize,
  })

  const deleteUser = useDeleteUser()

  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const handleEdit = useCallback((user: AppUser) => {
    setEditingUser(user)
    setIsUpdateDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (user: AppUser) => {
      try {
        await deleteUser.mutateAsync(user.userId)
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    },
    [deleteUser],
  )

  const handleToggleStatus = useCallback(async (user: AppUser) => {
    console.warn("Status toggle not implemented", user)
  }, [])

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleStatus: handleToggleStatus,
      }),
    [handleEdit, handleDelete, handleToggleStatus],
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <div className="flex items-center gap-2">
          <InviteUserDialog />
          <CreateUserDialog />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.list ?? []}
        isLoading={isLoading}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: data?.total ?? 0,
          onPageChange: pagination.setPage,
          onPageSizeChange: pagination.setPageSize,
        }}
      />

      <UpdateUserDialog
        user={editingUser}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
    </div>
  )
}
