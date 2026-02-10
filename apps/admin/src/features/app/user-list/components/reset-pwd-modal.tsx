import { sha1Hex } from "@goi/utils-web"
import { Form, Input, Modal, message } from "antd"
import { useState } from "react"
import { updateAppUser } from "@/api/service/app/user"

interface ResetPwdModalProps {
  open: boolean
  userId: string
  username: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ResetPwdModal({ open, userId, username, onOpenChange, onSuccess }: ResetPwdModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const password = await sha1Hex(values.password)

      const { code, message: msg } = await updateAppUser({
        userId,
        password,
      })

      if (code === 200) {
        message.success("重置密码成功")
        onSuccess()
        onOpenChange(false)
      } else {
        message.error(msg || "重置密码失败")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={`重置密码 - ${username}`}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      confirmLoading={submitting}
      afterClose={() => form.resetFields()}
    >
      <Form
        className="mt-4!"
        form={form}
        preserve={false}
      >
        <Form.Item
          name="password"
          label="新密码"
          rules={[{ required: true, message: "请输入新密码" }]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
