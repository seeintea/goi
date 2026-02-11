import type { AppPermission, CreateAppPermission, UpdateAppPermission } from "@goi/contracts"
import { Form, Input, Modal, message, Select } from "antd"
import { useEffect, useState } from "react"
import { listAllAppModules } from "@/api/service/app/module"
import { createAppPermission, updateAppPermission } from "@/api/service/app/permission"

interface PermissionModalProps {
  open: boolean
  record?: AppPermission | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PermissionModal({ open, record, onOpenChange, onSuccess }: PermissionModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [modules, setModules] = useState<{ label: string; value: string }[]>([])
  const isEdit = !!record

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { code, data } = await listAllAppModules()
        if (code === 200) {
          setModules(data.map((m) => ({ label: m.name, value: m.moduleId })))
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (open) {
      fetchModules()
    }
  }, [open])

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        code: record.code,
        name: record.name,
        // description: record.description, // Not in AppPermission type
        moduleId: record.moduleId,
      })
    }
  }, [open, record, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (isEdit) {
        const updateBody: UpdateAppPermission = {
          permissionId: record.permissionId,
          ...values,
        }

        const { code, message: msg } = await updateAppPermission(updateBody)
        if (code === 200) {
          message.success("更新成功")
          onSuccess()
          onOpenChange(false)
        } else {
          message.error(msg || "更新失败")
        }
      } else {
        const createBody: CreateAppPermission = {
          ...values,
        }
        const { code, message: msg } = await createAppPermission(createBody)
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
      title={isEdit ? "编辑按钮权限" : "新增按钮权限"}
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
          name="code"
          label="权限编码"
          rules={[{ required: true, message: "请输入权限编码" }]}
        >
          <Input placeholder="请输入权限编码 (例如: user:create)" />
        </Form.Item>

        <Form.Item
          name="name"
          label="权限名称"
          rules={[{ required: true, message: "请输入权限名称" }]}
        >
          <Input placeholder="请输入权限名称" />
        </Form.Item>

        {/* Note: Module ID selection could be added here if needed, or handled via context */}
        <Form.Item
          name="moduleId"
          label="所属模块"
          rules={[{ required: true, message: "请选择所属模块" }]}
        >
          <Select
            placeholder="请选择所属模块"
            options={modules}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
