import type { PageQuery, PageResult } from "@goi/contracts"
import { type FormInstance, message } from "antd"
import type { TablePaginationConfig } from "antd/es/table"
import { useCallback, useEffect, useState } from "react"

interface UseTableOptions<TQuery extends PageQuery> {
  defaultParams?: Partial<TQuery>
  form?: FormInstance
}

export function useTable<TData, TQuery extends PageQuery>(
  api: (params: TQuery) => Promise<{ code: number; data: PageResult<TData>; message?: string }>,
  options: UseTableOptions<TQuery> = {},
) {
  const { defaultParams, form } = options

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TData[]>([])
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState<TQuery>({
    page: 1,
    pageSize: 10,
    ...defaultParams,
  } as TQuery)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // Merge form values if form instance is provided
      const formValues = form ? form.getFieldsValue() : {}
      const params = { ...queryParams, ...formValues }

      const { code, data, message: msg } = await api(params)
      if (code === 200) {
        setData(data.list)
        setTotal(data.total)
      } else {
        message.error(msg || "获取列表失败")
      }
    } catch (error) {
      console.error(error)
      message.error("获取列表失败")
    } finally {
      setLoading(false)
    }
  }, [api, queryParams, form])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTableChange = useCallback((pagination: TablePaginationConfig) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
    }))
  }, [])

  const handleSearch = useCallback((values: Partial<TQuery>) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      ...values,
    }))
  }, [])

  const handleReset = () => {
    if (form) {
      form.resetFields()
    }
    setQueryParams({
      page: 1,
      pageSize: 10,
      ...defaultParams,
    } as TQuery)
  }

  const refresh = () => {
    fetchData()
  }

  return {
    tableProps: {
      loading,
      dataSource: data,
      pagination: {
        current: Number(queryParams.page ?? 1),
        pageSize: Number(queryParams.pageSize ?? 10),
        total,
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条`,
      },
      onChange: handleTableChange,
      rowKey: "id" as const, // Default rowKey, can be overridden
    },
    queryParams,
    search: {
      submit: handleSearch,
      reset: handleReset,
    },
    refresh,
  }
}
