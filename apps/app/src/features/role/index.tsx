import type { AppRole } from "@goi/contracts"
import { useCallback, useMemo, useState } from "react"

import { useDeleteRole, useRoleList } from "@/api/queries/role"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { useUser } from "@/stores/useUser"
import { getRoleColumns } from "./columns"
import { CreateRoleDialog } from "./components/create-dialog"
import { UpdateRoleDialog } from "./components/update-dialog"

export function Role() {
  const familyId = useUser((s) => s.familyId)

  const pagination = usePagination({})
  const { data, isLoading } = useRoleList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    familyId: familyId || undefined,
  })

  const deleteRole = useDeleteRole()

  const [editingRole, setEditingRole] = useState<AppRole | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const handleEdit = useCallback((role: AppRole) => {
    setEditingRole(role)
    setIsUpdateDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (role: AppRole) => {
      try {
        await deleteRole.mutateAsync(role.roleId)
      } catch (error) {
        console.error("Failed to delete role:", error)
      }
    },
    [deleteRole],
  )

  const columns = useMemo(
    () =>
      getRoleColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">角色管理</h1>
        <div className="flex items-center gap-2">
          <CreateRoleDialog />
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

      <UpdateRoleDialog
        role={editingRole}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
    </div>
  )
}
