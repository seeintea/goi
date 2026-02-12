import type { AppModule, AppPermission } from "@goi/contracts"
import { Button, Card, Form, message, Popconfirm, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import { listAllAppModules } from "@/api/service/app/module"
import { type AppPermissionListQuery, deleteAppPermission, listAppPermissions } from "@/api/service/app/permission"
import { type FilterField, FilterForm } from "@/components/filter-form"
import { ShortId } from "@/components/short-id"
import { useModal } from "@/hooks/use-modal"
import { useTable } from "@/hooks/use-table"
import { PermissionModal } from "./components/permission-modal"

export function PermissionList() {
  const [form] = Form.useForm()
  const [modules, setModules] = useState<AppModule[]>([])

  useEffect(() => {
    listAllAppModules().then(({ code, data }) => {
      if (code === 200) {
        setModules(data)
      }
    })
  }, [])

  const { tableProps, search, refresh } = useTable<AppPermission, AppPermissionListQuery>(listAppPermissions, {
    form,
    defaultParams: {
      code: undefined,
      moduleId: undefined,
    },
  })

  const permissionModal = useModal<AppPermission>()

  const handleCreate = () => {
    permissionModal.show()
  }

  const handleEdit = (record: AppPermission) => {
    permissionModal.show(record)
  }

  const handleDelete = async (record: AppPermission) => {
    try {
      const { code, message: msg } = await deleteAppPermission(record.permissionId)
      if (code === 200) {
        message.success("删除成功")
        refresh()
      } else {
        message.error(msg || "删除失败")
      }
    } catch (error) {
      console.error(error)
      message.error("删除失败")
    }
  }

  const columns: ColumnsType<AppPermission> = [
    {
      title: "权限ID",
      dataIndex: "permissionId",
      align: "center",
      width: 100,
      render: (id: string) => <ShortId id={id} />,
    },
    {
      title: "权限编码",
      dataIndex: "code",
      align: "center",
      width: 200,
      render: (code: string) => <Tag color="geekblue">{code || "-"}</Tag>,
    },
    {
      title: "权限名称",
      dataIndex: "name",
      align: "center",
      width: 150,
    },
    {
      title: "模块名称",
      dataIndex: "moduleName",
      align: "center",
      width: 150,
      render: (name: string) => name || "-",
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createdAt",
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            className="p-0"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              className="p-0"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filterFields: FilterField[] = [
    { name: "code", label: "权限编码", type: "input" },
    {
      name: "moduleId",
      label: "模块名称",
      type: "select",
      options: modules.map((m) => ({ label: m.name, value: m.moduleId })),
      props: {
        showSearch: true,
        filterOption: (input: string, option?: { label: string; value: string }) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      },
    },
  ]

  return (
    <Card>
      <FilterForm
        form={form}
        fields={filterFields}
        onSearch={search.submit}
        onReset={search.reset}
      />

      <div className="mb-4">
        <Button
          type="primary"
          onClick={handleCreate}
        >
          新增按钮权限
        </Button>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        scroll={{ x: 1000 }}
        rowKey="permissionId"
      />

      <PermissionModal
        open={permissionModal.open}
        record={permissionModal.data}
        onOpenChange={permissionModal.hide}
        onSuccess={refresh}
      />
    </Card>
  )
}
