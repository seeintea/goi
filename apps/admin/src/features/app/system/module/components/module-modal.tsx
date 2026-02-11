import type { AppModule, CreateAppModule, UpdateAppModule } from "@goi/contracts"
import { Form, Input, Modal, message, Select } from "antd"
import { useEffect, useState } from "react"
import { createAppModule, listRootAppModules, updateAppModule } from "@/api/service/app/module"

interface ModuleModalProps {
  open: boolean
  record?: AppModule | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ModuleModal({ open, record, onOpenChange, onSuccess }: ModuleModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [rootModules, setRootModules] = useState<{ label: string; value: string }[]>([])
  const isEdit = !!record

  useEffect(() => {
    const fetchRootModules = async () => {
      try {
        const { code, data } = await listRootAppModules()
        if (code === 200) {
          setRootModules(data.map((m) => ({ label: m.name, value: m.moduleId })))
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (open) {
      fetchRootModules()
    }
  }, [open])

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        name: record.name,
        routePath: record.routePath,
        permissionCode: record.permissionCode,
        parentId: record.parentId,
      })
    }
  }, [open, record, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (isEdit) {
        const updateBody: UpdateAppModule = {
          moduleId: record.moduleId,
          ...values,
        }

        const { code, message: msg } = await updateAppModule(updateBody)
        if (code === 200) {
          message.success("更新成功")
          onSuccess()
          onOpenChange(false)
        } else {
          message.error(msg || "更新失败")
        }
      } else {
        const createBody: CreateAppModule = {
          ...values,
        }
        const { code, message: msg } = await createAppModule(createBody)
        if (code === 200) {
          message.success("创建成功")
          onSuccess()
          onOpenChange(false)
        } else {
          message.error(msg || "创建失败")
        }
      }
    } catch (error) {
      console.error(error)
      // Form validation error or API error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={isEdit ? "编辑路由模块" : "新增路由模块"}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      confirmLoading={submitting}
      afterClose={() => form.resetFields()}
    >
      <Form
        className="mt-4!"
        form={form}
        labelCol={{ span: 4 }}
        preserve={false}
      >
        <Form.Item
          name="name"
          label="模块名称"
          rules={[{ required: true, message: "请输入模块名称" }]}
        >
          <Input placeholder="请输入模块名称" />
        </Form.Item>

        <Form.Item
          name="routePath"
          label="路由路径"
        >
          <Input placeholder="请输入路由路径 (例如: /system/user)" />
        </Form.Item>

        <Form.Item
          name="permissionCode"
          label="权限编码"
        >
          <Input placeholder="请输入权限编码" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="父模块ID"
        >
          <Select
            placeholder="请选择父模块ID (可选)"
            options={rootModules}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
