import { useEffect, useMemo, useState } from "react"

import type { Module as ModuleModel } from "@/api/controllers/module"
import { useDeleteModule, useModuleAll, useModuleList, useRootModules, useUpdateModule } from "@/api/react-query/module"
import { DataTable } from "@/components/data-table"
import { getModuleColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"
import { EditDialog } from "./components/edit-dialog"

export function Module() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [editOpen, setEditOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleModel | null>(null)

  const updateModuleMutation = useUpdateModule()
  const deleteModuleMutation = useDeleteModule()

  const query = useMemo(() => {
    return {
      page,
      pageSize,
    }
  }, [page, pageSize])

  const { data, isLoading, isFetching } = useModuleList(query)
  const { data: allModules } = useModuleAll()
  const { data: rootModules } = useRootModules()

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

  useEffect(() => {
    const total = data?.total ?? 0
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [data?.total, page, pageSize])

  const isBusy = updateModuleMutation.isPending || deleteModuleMutation.isPending
  const columns = useMemo(() => {
    return getModuleColumns({
      isBusy,
      moduleNameById,
      onEdit: (module) => {
        setEditingModule(module)
        setEditOpen(true)
      },
      onDelete: async (module) => {
        await deleteModuleMutation.mutateAsync(module.moduleId)
      },
    })
  }, [deleteModuleMutation, isBusy, moduleNameById])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">模块管理</div>
        <CreateDialog
          parentOptions={parentOptions}
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
