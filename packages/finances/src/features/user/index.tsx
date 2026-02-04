import { useCallback, useEffect, useMemo } from "react"
import type { User as UserModel } from "@/api"
import { useDeleteUser, useUpdateUser, useUserList } from "@/api"
import { DataTable } from "@/components/base/data-table"
import { usePagination } from "@/hooks/use-pagination"
import { getUserColumns } from "./columns"
import { CreateDialog } from "./components/create-dialog"

export function User() {
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const pagination = usePagination({})

  const query = useMemo(() => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }, [pagination.page, pagination.pageSize])

  const { data, isLoading, isFetching } = useUserList(query)

  useEffect(() => {
    pagination.setTotal(data?.total ?? 0)
  }, [data?.total, pagination.setTotal])

  const handleToggleDisabled = useCallback(
    (user: UserModel) => {
      updateUserMutation.mutate({
        userId: user.userId,
        isDisabled: !user.isDisabled,
      })
    },
    [updateUserMutation],
  )

  const handleDelete = useCallback(
    async (user: UserModel) => {
      await deleteUserMutation.mutateAsync(user.userId)
    },
    [deleteUserMutation],
  )

  const columns = useMemo(() => {
    return getUserColumns({
      onToggleDisabled: handleToggleDisabled,
      onDelete: handleDelete,
    })
  }, [handleDelete, handleToggleDisabled])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-medium">用户管理</div>
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
    </div>
  )
}
