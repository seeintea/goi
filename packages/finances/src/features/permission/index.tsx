import { useEffect, useMemo, useState } from "react"
import type { Permission as PermissionModel } from "@/api/controllers/permission"
import { useModuleAll } from "@/api/react-query/module"
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
      moduleLabelById,
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
  }, [deletePermissionMutation, isBusy, moduleLabelById, updatePermissionMutation])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">权限管理</div>
        <CreateDialog
          moduleOptions={moduleOptions}
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
