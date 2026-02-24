import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useLogin } from "@/api/queries/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { useUser } from "@/stores/useUser"
import { sha1Hex } from "@/utils/crypto"
import { LoginForm, type LoginFormValues } from "./components/login-form"

export function Login() {
  const navigate = useNavigate()
  const setUser = useUser((state) => state.setUser)
  const loginMutation = useLogin()
  const [submitError, setSubmitError] = useState("")

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setSubmitError("")
    try {
      const password = await sha1Hex(values.password)
      const res = await loginMutation.mutateAsync({ username: values.username, password })

      if (res) {
        setUser({
          token: res.accessToken,
          userId: res.userId,
          username: res.username,
          roleId: res.roleId ?? "",
          roleName: res.roleName ?? "",
        })
        navigate({ to: "/" })
      }
    } catch (error) {
      console.error(error)
      setSubmitError((error as Error).message || "登录失败")
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入账号与密码</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FieldError errors={submitError ? [{ message: submitError }] : undefined} />
          </div>
          <LoginForm
            onSubmit={handleLoginSubmit}
            isPending={loginMutation.isPending}
          />
          <div className="text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
