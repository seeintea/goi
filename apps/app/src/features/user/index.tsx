import type { AppUser } from "@goi/contracts"
import { useCallback, useMemo, useState } from "react"
import { useRemoveFamilyMember } from "@/api/queries/family-member"

import { useUserList } from "@/api/queries/user"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { useUser } from "@/stores/useUser"
import { getUserColumns } from "./columns"
import { CreateUserDialog } from "./components/create-dialog"
import { InviteUserDialog } from "./components/invite-dialog"
import { ResetPasswordDialog } from "./components/reset-password-dialog"
import { UpdateUserDialog } from "./components/update-dialog"

export function User() {
  const currentUserId = useUser((s) => s.userId)
  const familyId = useUser((s) => s.familyId)

  const pagination = usePagination({})
  const { data, isLoading } = useUserList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    familyId: familyId || undefined,
  })

  const removeMember = useRemoveFamilyMember()

  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<AppUser | null>(null)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)

  const handleEdit = useCallback((user: AppUser) => {
    setEditingUser(user)
    setIsUpdateDialogOpen(true)
  }, [])

  const handleResetPassword = useCallback((user: AppUser) => {
    setResetPasswordUser(user)
    setIsResetPasswordDialogOpen(true)
  }, [])

  const handleExitFamily = useCallback(async () => {
    if (!familyId || !currentUserId) return
    try {
      await removeMember.mutateAsync({ familyId, userId: currentUserId })
      // Redirect or refresh? Usually redirect to login or family selection if multiple families supported
      // But for now maybe refresh page or logout
      window.location.reload()
    } catch (error) {
      console.error("Failed to exit family:", error)
    }
  }, [familyId, currentUserId, removeMember])

  const handleRemoveFromFamily = useCallback(
    async (user: AppUser) => {
      if (!familyId) return
      try {
        await removeMember.mutateAsync({ familyId, userId: user.userId })
      } catch (error) {
        console.error("Failed to remove member:", error)
      }
    },
    [familyId, removeMember],
  )

  const columns = useMemo(
    () =>
      getUserColumns({
        currentUserId,
        onEdit: handleEdit,
        onResetPassword: handleResetPassword,
        onExitFamily: handleExitFamily,
        onRemoveFromFamily: handleRemoveFromFamily,
      }),
    [currentUserId, handleEdit, handleResetPassword, handleExitFamily, handleRemoveFromFamily],
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
      <ResetPasswordDialog
        user={resetPasswordUser}
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      />
    </div>
  )
}
