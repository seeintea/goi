import type { AppModule } from "@goi/contracts"
import { Button, Card, Form, message, Popconfirm, Space, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { type AppModuleListQuery, deleteAppModule, listAppModules } from "@/api/service/app/module"
import { type FilterField, FilterForm } from "@/components/filter-form"
import { ShortId } from "@/components/short-id"
import { useModal } from "@/hooks/use-modal"
import { useTable } from "@/hooks/use-table"
import { RoutesModal } from "./components/routes-modal"

export function RoutesList() {
  const [form] = Form.useForm()

  const { tableProps, search, refresh } = useTable<AppModule, AppModuleListQuery>(listAppModules, {
    form,
    defaultParams: {
      name: undefined,
      routePath: undefined,
      permissionCode: undefined,
    },
  })

  const routesModal = useModal<AppModule>()

  const handleCreate = () => {
    routesModal.show()
  }

  const handleEdit = (record: AppModule) => {
    routesModal.show(record)
  }

  const handleDelete = async (record: AppModule) => {
    try {
      const { code, message: msg } = await deleteAppModule(record.moduleId)
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

  const columns: ColumnsType<AppModule> = [
    {
      title: "模块ID",
      align: "center",
      dataIndex: "moduleId",
      width: 100,
      render: (id: string) => <ShortId id={id} />,
    },
    {
      title: "模块名称",
      align: "center",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "路由路径",
      align: "center",
      dataIndex: "routePath",
      width: 200,
    },
    {
      title: "权限编码",
      align: "center",
      dataIndex: "permissionCode",
      width: 150,
    },
    {
      title: "父模块ID",
      align: "center",
      dataIndex: "parentId",
      width: 100,
      render: (id: string) => (id ? <ShortId id={id} /> : "-"),
    },
    {
      title: "排序",
      align: "center",
      dataIndex: "order",
      width: 80,
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createTime",
      width: 180,
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      width: 150,
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
    { name: "name", label: "模块名称", type: "input" },
    { name: "routePath", label: "路由路径", type: "input" },
    { name: "permissionCode", label: "权限编码", type: "input" },
  ]

  return (
    <Card bordered={false}>
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
          新增路由模块
        </Button>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        scroll={{ x: 1200 }}
        rowKey="moduleId"
      />

      <RoutesModal
        open={routesModal.open}
        record={routesModal.data}
        onOpenChange={routesModal.hide}
        onSuccess={refresh}
      />
    </Card>
  )
}
