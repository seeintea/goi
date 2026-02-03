import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"

import { createUser, useLogin } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { sha1Hex } from "@/lib/crypto"
import { LoginForm } from "./components/login-form"
import { RegisterForm, type RegisterFormValues } from "./components/register-form"

type FormMode = "login" | "register"

export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const registerMutation = useMutation({ mutationFn: createUser })

  const [mode, setMode] = useState<FormMode>("login")
  const [prefillUsername, setPrefillUsername] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const isPending = loginMutation.isPending || registerMutation.isPending

  const clearMessages = useCallback(() => {
    setSubmitError("")
    setSubmitSuccess("")
  }, [])

  const handleLoginSubmit = useCallback(
    async (values: { username: string; password: string }) => {
      clearMessages()
      try {
        const password = await sha1Hex(values.password)
        const resp = await loginMutation.mutateAsync({ username: values.username, password })
        if (resp.code !== 200) {
          setSubmitError(resp.message || "登录失败")
          return
        }
        navigate({ to: "/" })
      } catch (error) {
        const e = error as Error
        setSubmitError(e.message || "登录失败")
      }
    },
    [clearMessages, loginMutation, navigate],
  )

  const handleRegisterSubmit = useCallback(
    async (values: RegisterFormValues) => {
      clearMessages()
      try {
        const resp = await registerMutation.mutateAsync({
          username: values.username.trim(),
          password: await sha1Hex(values.password),
          email: values.email.trim() ? values.email.trim() : undefined,
          phone: values.phone.trim() ? values.phone.trim() : undefined,
        })

        if (resp.code !== 200) {
          setSubmitError(resp.message || "注册失败")
          return
        }

        setSubmitSuccess("注册成功，请登录")
        setPrefillUsername(values.username.trim())
        setMode("login")
      } catch (error) {
        const e = error as Error
        setSubmitError(e.message || "注册失败")
      }
    },
    [clearMessages, registerMutation],
  )

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "login" ? "登录" : "注册"}</CardTitle>
          <CardDescription>{mode === "login" ? "请输入账号与密码" : "请填写注册信息"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FieldError errors={submitError ? [{ message: submitError }] : undefined} />
            {submitSuccess ? <div className="text-sm text-emerald-600">{submitSuccess}</div> : null}
          </div>

          {mode === "login" ? (
            <LoginForm
              prefillUsername={prefillUsername}
              isPending={isPending}
              onSubmit={handleLoginSubmit}
            />
          ) : (
            <RegisterForm
              isPending={isPending}
              onSubmit={handleRegisterSubmit}
            />
          )}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="link"
              disabled={isPending}
              onClick={() => {
                clearMessages()
                setMode((prev) => (prev === "login" ? "register" : "login"))
              }}
            >
              {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
