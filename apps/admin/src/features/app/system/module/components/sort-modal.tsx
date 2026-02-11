import type { AppModule } from "@goi/contracts"
import { Form, Modal, message, Select, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import {
  listAllAppModules,
  listParentAppModules,
  listRootAppModules,
  updateAppModuleSort,
} from "@/api/service/app/module"
import { SortableTable } from "@/components/sortable-table"

interface SortModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SortModal({ open, onOpenChange, onSuccess }: SortModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [rootModules, setRootModules] = useState<{ label: string; value: string }[]>([])
  const [items, setItems] = useState<AppModule[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchParentModules = async () => {
      try {
        const { code, data } = await listParentAppModules()
        if (code === 200) {
          setRootModules(data.map((m) => ({ label: m.name, value: m.moduleId })))
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (open) {
      fetchParentModules()
      // Default to Global (null)
      setParentId(null)
      form.setFieldValue("parentId", "global")
    } else {
      setItems([])
      setRootModules([])
      setParentId(null)
      form.resetFields()
    }
  }, [open, form])

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true)
      try {
        let code = 0
        let data: AppModule[] = []

        if (parentId === null) {
          const res = await listRootAppModules()
          code = res.code
          data = res.data
        } else {
          const res = await listAllAppModules({ parentId })
          code = res.code
          data = res.data
        }

        if (code === 200) {
          setItems(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchModules()
    }
  }, [parentId, open])

  const handleParentChange = (value: string) => {
    setParentId(value === "global" ? null : value)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { code } = await updateAppModuleSort({
        parentId,
        moduleIds: items.map((item) => item.moduleId),
      })
      if (code === 200) {
        message.success("排序更新成功")
        onOpenChange(false)
        onSuccess()
      } else {
        message.error("排序更新失败")
      }
    } catch (error) {
      console.error(error)
      message.error("排序更新失败")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<AppModule> = [
    {
      title: "模块名称",
      dataIndex: "name",
      align: "center",
      width: 150,
      key: "name",
    },
    {
      title: "路由路径",
      dataIndex: "routePath",
      align: "center",
      key: "routePath",
      render: (routePath) => <Tag color={"geekblue"}>{routePath || "-"}</Tag>,
    },
    {
      title: "当前排序",
      align: "center",
      key: "sort",
      render: (_, __, index) => index + 1,
      width: 80,
    },
  ]

  return (
    <Modal
      title="模块排序"
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={550}
    >
      <div className="mb-4">
        <Form
          form={form}
          layout="inline"
        >
          <Form.Item
            label="父模块"
            name="parentId"
            initialValue="global"
          >
            <Select
              style={{ width: 200 }}
              onChange={handleParentChange}
              options={[{ label: "全局模块 (根模块)", value: "global" }, ...rootModules]}
              placeholder="选择父模块"
            />
          </Form.Item>
        </Form>
      </div>

      <SortableTable
        rowKey="moduleId"
        columns={columns}
        dataSource={items}
        pagination={false}
        loading={loading}
        scroll={{ y: 400 }}
        size="small"
        onSortEnd={setItems}
      />
    </Modal>
  )
}
