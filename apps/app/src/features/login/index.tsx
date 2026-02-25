import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { loginFn } from "@/api/server/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { useUser } from "@/stores/useUser"
import { sha1Hex } from "@/utils/crypto"
import { LoginForm, type LoginFormValues } from "./components/login-form"

export function Login() {
  const navigate = useNavigate()
  const setUser = useUser((state) => state.setUser)
  const [isPending, setIsPending] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setSubmitError("")
    setIsPending(true)
    try {
      const password = await sha1Hex(values.password)
      const resp = await loginFn({ data: { username: values.username, password } })

      if (resp) {
        setUser({
          token: resp.accessToken,
          userId: resp.userId,
          username: resp.username,
          roleId: resp.roleId ?? "",
          roleName: resp.roleName ?? "",
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
            isPending={isPending}
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
