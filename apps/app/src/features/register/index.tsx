import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { login, register } from "@/api/service/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { sha1Hex } from "@/lib/crypto"
import { useUser } from "@/stores/useUser"
import { RegisterForm, type RegisterFormValues } from "./components/register-form"

export function Register() {
  const navigate = useNavigate()
  const setUser = useUser((state) => state.setUser)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setSubmitError("")
    setSubmitSuccess("")
    setIsPending(true)
    try {
      const username = values.username.trim()
      const password = await sha1Hex(values.password)

      const resp = await register({
        data: {
          username,
          password,
          email: values.email.trim() || undefined,
          phone: values.phone.trim() || undefined,
        },
      })

      if (resp.error) {
        setSubmitError(resp.error)
        return
      }

      setSubmitSuccess("注册成功，正在登录...")

      // Auto login
      const loginResp = await login({ data: { username, password } })
      if (loginResp.error || !loginResp.data) {
        setSubmitError(loginResp.error || "登录失败")
        setSubmitSuccess("")
        return
      }

      setUser({
        token: loginResp.data.accessToken,
        userId: loginResp.data.userId,
        username: loginResp.data.username,
        roleId: loginResp.data.roleId ?? "",
        roleName: loginResp.data.roleName ?? "",
      })

      navigate({ to: "/" })
    } catch (error) {
      const e = error as Error
      setSubmitError(e.message || "注册失败")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>请填写注册信息</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FieldError errors={submitError ? [{ message: submitError }] : undefined} />
            {submitSuccess ? <div className="text-sm text-emerald-600">{submitSuccess}</div> : null}
          </div>
          <RegisterForm
            onSubmit={handleRegisterSubmit}
            isPending={isPending}
          />
          <div className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              直接登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
