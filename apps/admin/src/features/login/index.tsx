import { sha1Hex } from "@goi/utils-web"
import { useNavigate } from "@tanstack/react-router"
import { Button, Card, Form, Input, message, Typography } from "antd"
import { useState } from "react"
import { login } from "@/api/service/admin/auth"
import { useUser } from "@/stores"

type LoginFormValues = {
  username: string
  password: string
}

export function Login() {
  const [messageApi, contextHolder] = message.useMessage()
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const setToken = useUser((state) => state.setToken)

  const handleFinish = async (values: LoginFormValues) => {
    try {
      setSubmitting(true)
      const { username, password } = values
      const resp = await login({
        username,
        password: await sha1Hex(password),
      })
      if (resp.code !== 200) {
        messageApi.error(resp.message || "登录失败")
        return
      }
      setToken(resp.data.accessToken)
      await navigate({ to: "/" })
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "登录失败"
      messageApi.error(messageText)
      setToken("test11111")
      await navigate({ to: "/" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={"h-screen flex items-center justify-center p-6"}>
      {contextHolder}
      <Card className={"w-96"}>
        <Typography.Title
          level={3}
          style={{ marginBottom: 8 }}
        >
          账簿 / 运营后台
        </Typography.Title>
        <Typography.Text type="secondary">请输入账号与密码继续</Typography.Text>
        <Form
          layout="vertical"
          className={"pt-6!"}
          onFinish={handleFinish}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
