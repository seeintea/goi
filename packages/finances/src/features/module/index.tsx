import { useCallback, useEffect, useMemo, useState } from "react"

import type { Module as ModuleModel } from "@/api"
import { useDeleteModule, useModuleAll, useModuleList, useRootModules, useUpdateModule } from "@/api"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { getModuleColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"
import { EditDialog } from "./components/edit-dialog"

export function Module() {
  const [editOpen, setEditOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleModel | null>(null)

  const updateModuleMutation = useUpdateModule()
  const deleteModuleMutation = useDeleteModule()

  const pagination = usePagination({})

  const query = useMemo(() => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }, [pagination.page, pagination.pageSize])

  const { data, isLoading, isFetching } = useModuleList(query)
  const { data: allModules } = useModuleAll()
  const { data: rootModules } = useRootModules()

  useEffect(() => {
    pagination.setTotal(data?.total ?? 0)
  }, [data?.total, pagination.setTotal])

  const moduleNameById = useMemo(() => {
    return (allModules ?? []).reduce<Record<string, string>>((prev, next) => {
      prev[next.moduleId] = next.name
      return prev
    }, {})
  }, [allModules])

  const parentOptions = useMemo(() => {
    const options = (rootModules ?? []).map((m) => ({ value: m.moduleId, label: m.name }))
    return [{ value: "", label: "无" }, ...options]
  }, [rootModules])

  const isBusy = updateModuleMutation.isPending

  const handleEdit = useCallback((module: ModuleModel) => {
    setEditingModule(module)
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (module: ModuleModel) => {
      await deleteModuleMutation.mutateAsync(module.moduleId)
    },
    [deleteModuleMutation],
  )

  const columns = useMemo(() => {
    return getModuleColumns({
      moduleNameById,
      onEdit: handleEdit,
      onDelete: handleDelete,
    })
  }, [handleDelete, handleEdit, moduleNameById])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">模块管理</div>
        <CreateDialog
          parentOptions={parentOptions}
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
        module={editingModule}
        isBusy={isBusy}
        parentOptions={parentOptions}
        onOpenChange={(open) => {
          if (isBusy) return
          setEditOpen(open)
          if (!open) setEditingModule(null)
        }}
        onSubmit={async (values) => {
          if (!editingModule) return
          await updateModuleMutation.mutateAsync({
            moduleId: editingModule.moduleId,
            name: values.name.trim(),
            routePath: values.routePath.trim(),
            permissionCode: values.permissionCode.trim(),
            parentId: values.parentId.trim() ? values.parentId.trim() : null,
            sort: Number.isFinite(values.sort) ? values.sort : undefined,
          })
          setEditOpen(false)
          setEditingModule(null)
        }}
      />
    </div>
  )
}
