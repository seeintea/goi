import type { AppUser, CreateAppUser, UpdateAppUser } from "@goi/contracts"
import { sha1Hex } from "@goi/utils-web"
import { Form, Input, Modal, message } from "antd"
import { useEffect, useState } from "react"
import { createAppUser, updateAppUser } from "@/api/service/app/user"

interface UserModalProps {
  open: boolean
  record?: AppUser | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UserModal({ open, record, onOpenChange, onSuccess }: UserModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!record

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        username: record.username,
        email: record.email,
        phone: record.phone,
      })
    }
  }, [open, record, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (values.password) {
        values.password = await sha1Hex(values.password)
      }

      if (isEdit) {
        const updateBody: UpdateAppUser = {
          userId: record.userId,
          ...values,
        }

        const { code, message: msg } = await updateAppUser(updateBody)
        if (code === 200) {
          message.success("更新成功")
          onSuccess()
          onOpenChange(false)
        } else {
          message.error(msg || "更新失败")
        }
      } else {
        const createBody: CreateAppUser = {
          ...values,
          isDisabled: false, // Default to enabled
        }
        const { code, message: msg } = await createAppUser(createBody)
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
      title={isEdit ? "编辑用户" : "新增用户"}
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
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ type: "email", message: "请输入有效的邮箱格式" }]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
