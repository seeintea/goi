import type { Tag as TagType } from "@goi/contracts"
import { useCallback, useMemo, useState } from "react"

import { useDeleteTag, useTagList } from "@/api/queries/tag"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { useUser } from "@/stores/useUser"
import { getTagColumns } from "./columns"
import { CreateTagDialog } from "./components/create-dialog"
import { UpdateTagDialog } from "./components/update-dialog"

export function Tag() {
  const familyId = useUser((s) => s.familyId)

  const pagination = usePagination({})
  const { data, isLoading } = useTagList(
    familyId
      ? {
          page: pagination.page,
          pageSize: pagination.pageSize,
          familyId,
        }
      : undefined,
  )

  const deleteTag = useDeleteTag()

  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const handleEdit = useCallback((tag: TagType) => {
    setEditingTag(tag)
    setIsUpdateDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (tag: TagType) => {
      try {
        await deleteTag.mutateAsync(tag.id)
      } catch (error) {
        console.error("Failed to delete tag:", error)
      }
    },
    [deleteTag],
  )

  const columns = useMemo(
    () =>
      getTagColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">标签管理</h1>
        <div className="flex items-center gap-2">
          <CreateTagDialog />
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

      <UpdateTagDialog
        tag={editingTag}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
    </div>
  )
}
