import { useCallback, useEffect, useMemo, useState } from "react"

import type { Role as RoleModel } from "@/api/controllers/role"
import { useDeleteRole, useRoleList, useUpdateRole } from "@/api/react-query/role"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { getRoleColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"
import { EditDialog } from "./components/edit-dialog"

export function Role() {
  const [editOpen, setEditOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleModel | null>(null)

  const updateRoleMutation = useUpdateRole()
  const deleteRoleMutation = useDeleteRole()

  const pagination = usePagination({})

  const query = useMemo(() => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }, [pagination.page, pagination.pageSize])

  const { data, isLoading, isFetching } = useRoleList(query)

  useEffect(() => {
    pagination.setTotal(data?.total ?? 0)
  }, [data?.total, pagination.setTotal])

  const isBusy = updateRoleMutation.isPending

  const handleEdit = useCallback((role: RoleModel) => {
    setEditingRole(role)
    setEditOpen(true)
  }, [])

  const handleToggleDisabled = useCallback(
    (role: RoleModel) => {
      updateRoleMutation.mutate({
        roleId: role.roleId,
        isDisabled: !role.isDisabled,
      })
    },
    [updateRoleMutation],
  )

  const handleDelete = useCallback(
    async (role: RoleModel) => {
      await deleteRoleMutation.mutateAsync(role.roleId)
    },
    [deleteRoleMutation],
  )

  const columns = useMemo(() => {
    return getRoleColumns({
      onEdit: handleEdit,
      onToggleDisabled: handleToggleDisabled,
      onDelete: handleDelete,
    })
  }, [handleDelete, handleEdit, handleToggleDisabled])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">角色管理</div>
        <CreateDialog
          onCreated={() => {
            pagination.setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.list ?? []}
        isLoading={isLoading || isFetching}
        pagination={pagination.pagination}
      />

      <EditDialog
        open={editOpen}
        role={editingRole}
        isBusy={isBusy}
        onOpenChange={(open) => {
          if (isBusy) return
          setEditOpen(open)
          if (!open) setEditingRole(null)
        }}
        onSubmit={async (values) => {
          if (!editingRole) return
          await updateRoleMutation.mutateAsync({
            roleId: editingRole.roleId,
            roleCode: values.roleCode.trim(),
            roleName: values.roleName.trim(),
          })
          setEditOpen(false)
          setEditingRole(null)
        }}
      />
    </div>
  )
}
