import { Form, Input, Modal, message, Switch } from "antd"
import { useEffect, useState } from "react"
import type { AppRole, CreateAppRole, UpdateAppRole } from "@/api/service/app/role"
import { createAppRole, updateAppRole } from "@/api/service/app/role"

interface RoleModalProps {
  open: boolean
  record?: AppRole | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RoleModal({ open, record, onOpenChange, onSuccess }: RoleModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!record

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        roleCode: record.roleCode,
        roleName: record.roleName,
        isDisabled: record.isDisabled,
      })
    } else {
      form.resetFields()
    }
  }, [open, record, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (isEdit) {
        const updateBody: UpdateAppRole = {
          roleId: record.roleId,
          ...values,
        }

        const { code, message: msg } = await updateAppRole(updateBody)
        if (code === 200) {
          message.success("更新成功")
          onSuccess()
          onOpenChange(false)
        } else {
          message.error(msg || "更新失败")
        }
      } else {
        const createBody: CreateAppRole = {
          ...values,
          // Ensure familyId is not sent on create
          familyId: undefined,
        }
        const { code, message: msg } = await createAppRole(createBody)
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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={isEdit ? "编辑角色" : "新增角色"}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      confirmLoading={submitting}
      afterClose={() => form.resetFields()}
    >
      <Form
        className="mt-4"
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        initialValues={{ isDisabled: false }}
      >
        <Form.Item
          name="roleCode"
          label="角色编码"
          rules={[{ required: true, message: "请输入角色编码" }]}
        >
          <Input
            placeholder="请输入角色编码 (例如: admin)"
            disabled={isEdit}
          />
        </Form.Item>

        <Form.Item
          name="roleName"
          label="角色名称"
          rules={[{ required: true, message: "请输入角色名称" }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          name="isDisabled"
          label="是否禁用"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
