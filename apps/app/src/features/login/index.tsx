import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { login } from "@/api/service/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { sha1Hex } from "@/lib/crypto"
import { useUser } from "@/stores/useUser"
import { LoginForm, type LoginFormValues } from "./components/login-form"

export function Login() {
  const navigate = useNavigate()
  const setUser = useUser((state) => state.setUser)
  const [submitError, setSubmitError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setSubmitError("")
    setIsPending(true)
    try {
      const password = await sha1Hex(values.password)
      const res = await login({ data: { username: values.username, password } })

      if (res?.error) {
        setSubmitError(res.error)
        return
      }

      if (res.data) {
        setUser({
          token: res.data.accessToken,
          userId: res.data.userId,
          username: res.data.username,
          roleId: res.data.roleId ?? "",
          roleName: res.data.roleName ?? "",
        })
        navigate({ to: "/" })
      }
    } catch (error) {
      console.error(error)
      // Redirects are handled automatically by the router/server function
    } finally {
      setIsPending(false)
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
