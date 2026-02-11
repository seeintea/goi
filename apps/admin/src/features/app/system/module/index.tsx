import type { AppModule } from "@goi/contracts"
import { Button, Card, Form, message, Popconfirm, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import {
  type AppModuleListQuery,
  deleteAppModule,
  listAppModules,
  listParentAppModules,
} from "@/api/service/app/module"
import { type FilterField, FilterForm } from "@/components/filter-form"
import { ShortId } from "@/components/short-id"
import { useModal } from "@/hooks/use-modal"
import { useTable } from "@/hooks/use-table"
import { ModuleModal } from "./components/module-modal"
import { SortModal } from "./components/sort-modal"

export function ModuleList() {
  const [form] = Form.useForm()
  const [modules, setModules] = useState<AppModule[]>([])

  useEffect(() => {
    listParentAppModules().then(({ code, data }) => {
      if (code === 200) {
        setModules(data)
      }
    })
  }, [])

  const { tableProps, search, refresh } = useTable<AppModule, AppModuleListQuery>(listAppModules, {
    form,
    defaultParams: {
      name: undefined,
      parentId: undefined,
      routePath: undefined,
      permissionCode: undefined,
    },
  })

  const moduleModal = useModal<AppModule>()
  const sortModal = useModal<void>()

  const handleCreate = () => {
    moduleModal.show()
  }

  const handleSort = () => {
    sortModal.show()
  }

  const handleEdit = (record: AppModule) => {
    moduleModal.show(record)
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
      width: 150,
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
      render: (path: string) => <Tag color="default">{path || "-"}</Tag>,
    },
    {
      title: "权限编码",
      align: "center",
      dataIndex: "permissionCode",
      width: 150,
      render: (code: string) => <Tag color="geekblue">{code || "-"}</Tag>,
    },
    {
      title: "父模块名称",
      align: "center",
      dataIndex: "parentModuleName",
      width: 150,
      render: (name: string) => name || "-",
    },
    {
      title: "排序",
      align: "center",
      dataIndex: "sort",
      width: 80,
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createTime",
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
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
    {
      name: "parentId",
      label: "父模块",
      type: "select",
      options: [
        { label: "全局模块 (根模块)", value: "global" },
        ...modules.map((m) => ({ label: m.name, value: m.moduleId })),
      ],
      props: {
        showSearch: true,
        filterOption: (input: string, option?: { label: string; value: string }) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      },
    },
    { name: "routePath", label: "路由路径", type: "input" },
    { name: "permissionCode", label: "权限编码", type: "input" },
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
        <Space>
          <Button
            type="primary"
            onClick={handleCreate}
          >
            新增路由模块
          </Button>
          <Button onClick={handleSort}>排序</Button>
        </Space>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        scroll={{ x: 1200 }}
        rowKey="moduleId"
      />

      <ModuleModal
        open={moduleModal.open}
        record={moduleModal.data}
        onOpenChange={moduleModal.hide}
        onSuccess={refresh}
      />
      <SortModal
        open={sortModal.open}
        onOpenChange={sortModal.hide}
        onSuccess={refresh}
      />
    </Card>
  )
}
