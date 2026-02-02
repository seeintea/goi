import { useEffect, useMemo, useState } from "react"

import { useDeleteUser, useUpdateUser, useUserList } from "@/api"
import { DataTable } from "@/components/data-table"
import { getUserColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"

export function User() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const query = useMemo(() => {
    return {
      page,
      pageSize,
    }
  }, [page, pageSize])

  const { data, isLoading, isFetching } = useUserList(query)

  useEffect(() => {
    const total = data?.total ?? 0
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [data?.total, page, pageSize])

  const isBusy = updateUserMutation.isPending || deleteUserMutation.isPending
  const columns = useMemo(() => {
    return getUserColumns({
      isBusy,
      onToggleDisabled: (user) => {
        updateUserMutation.mutate({
          userId: user.userId,
          isDisabled: !user.isDisabled,
        })
      },
      onDelete: async (user) => {
        await deleteUserMutation.mutateAsync(user.userId)
      },
    })
  }, [deleteUserMutation, isBusy, updateUserMutation])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">用户管理</div>
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
    </div>
  )
}
