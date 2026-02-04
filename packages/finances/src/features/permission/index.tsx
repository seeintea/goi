import { useCallback, useEffect, useMemo, useState } from "react"
import type { Permission as PermissionModel } from "@/api"
import { useDeletePermission, useModuleAll, usePermissionList, useUpdatePermission } from "@/api"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { getPermissionColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"
import { EditDialog } from "./components/edit-dialog"

export function Permission() {
  const [editOpen, setEditOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionModel | null>(null)

  const updatePermissionMutation = useUpdatePermission()
  const deletePermissionMutation = useDeletePermission()

  const pagination = usePagination({})

  const query = useMemo(() => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }, [pagination.page, pagination.pageSize])

  const { data, isLoading, isFetching } = usePermissionList(query)

  const { data: moduleList } = useModuleAll()

  const moduleOptions = useMemo(() => {
    return (moduleList ?? []).map((m) => ({
      value: m.moduleId,
      label: m.name,
    }))
  }, [moduleList])

  const moduleLabelById = useMemo(() => {
    return (moduleList ?? []).reduce<Record<string, string>>((prev, next) => {
      prev[next.moduleId] = next.name
      return prev
    }, {})
  }, [moduleList])

  useEffect(() => {
    pagination.setTotal(data?.total ?? 0)
  }, [data?.total, pagination.setTotal])

  const isBusy = updatePermissionMutation.isPending

  const handleEdit = useCallback((permission: PermissionModel) => {
    setEditingPermission(permission)
    setEditOpen(true)
  }, [])

  const handleToggleDisabled = useCallback(
    (permission: PermissionModel) => {
      updatePermissionMutation.mutate({
        permissionId: permission.permissionId,
        isDisabled: !permission.isDisabled,
      })
    },
    [updatePermissionMutation],
  )

  const handleDelete = useCallback(
    async (permission: PermissionModel) => {
      await deletePermissionMutation.mutateAsync(permission.permissionId)
    },
    [deletePermissionMutation],
  )

  const columns = useMemo(() => {
    return getPermissionColumns({
      moduleLabelById,
      onEdit: handleEdit,
      onToggleDisabled: handleToggleDisabled,
      onDelete: handleDelete,
    })
  }, [handleDelete, handleEdit, handleToggleDisabled, moduleLabelById])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">权限管理</div>
        <CreateDialog
          moduleOptions={moduleOptions}
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
        permission={editingPermission}
        isBusy={isBusy}
        moduleOptions={moduleOptions}
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
            moduleId: values.moduleId.trim() ? values.moduleId.trim() : undefined,
          })
          setEditOpen(false)
          setEditingPermission(null)
        }}
      />
    </div>
  )
}
