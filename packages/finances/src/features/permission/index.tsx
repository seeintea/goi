import { useEffect, useMemo, useState } from "react"
import type { Permission as PermissionModel } from "@/api/controllers/permission"
import { useDeletePermission, usePermissionList, useUpdatePermission } from "@/api/react-query/permission"
import { DataTable } from "@/components/data-table"
import { getPermissionColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"
import { EditDialog } from "./components/edit-dialog"

export function Permission() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [editOpen, setEditOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionModel | null>(null)

  const updatePermissionMutation = useUpdatePermission()
  const deletePermissionMutation = useDeletePermission()

  const query = useMemo(() => {
    return {
      page,
      pageSize,
    }
  }, [page, pageSize])

  const { data, isLoading, isFetching } = usePermissionList(query)

  useEffect(() => {
    const total = data?.total ?? 0
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [data?.total, page, pageSize])

  const isBusy = updatePermissionMutation.isPending || deletePermissionMutation.isPending

  const columns = useMemo(() => {
    return getPermissionColumns({
      isBusy,
      onEdit: (permission) => {
        setEditingPermission(permission)
        setEditOpen(true)
      },
      onToggleDisabled: (permission) => {
        updatePermissionMutation.mutate({
          permissionId: permission.permissionId,
          isDisabled: !permission.isDisabled,
        })
      },
      onDelete: async (permission) => {
        await deletePermissionMutation.mutateAsync(permission.permissionId)
      },
    })
  }, [deletePermissionMutation, isBusy, updatePermissionMutation])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">权限管理</div>
        <CreateDialog
          onCreated={() => {
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.list ?? []}
        isLoading={isLoading || isFetching}
        pagination={{
          page,
          pageSize,
          total: data?.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
          },
          pageSizeOptions: [10, 20, 50, 100],
        }}
      />

      <EditDialog
        open={editOpen}
        permission={editingPermission}
        isBusy={isBusy}
        onOpenChange={(open) => {
          if (isBusy) return
          setEditOpen(open)
          if (!open) setEditingPermission(null)
        }}
        onSubmit={async (values) => {
          if (!editingPermission) return
          await updatePermissionMutation.mutateAsync({
            permissionId: editingPermission.permissionId,
            code: values.code.trim(),
            name: values.name.trim() ? values.name.trim() : undefined,
            module: values.module.trim() ? values.module.trim() : undefined,
          })
          setEditOpen(false)
          setEditingPermission(null)
        }}
      />
    </div>
  )
}
