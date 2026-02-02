import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useLogin } from "@/api"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldError, FieldGroup, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sha1Hex } from "@/lib/crypto"

type LoginFormValues = {
  username: string
  password: string
}

export function Login() {
  const loginMutation = useLogin()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("")
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
  })

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入账号与密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-5"
            onSubmit={onSubmit}
          >
            <FieldGroup>
              <FieldError errors={submitError ? [{ message: submitError }] : undefined} />

              <Field data-invalid={Boolean(errors.username)}>
                <FieldTitle>用户名</FieldTitle>
                <FieldContent>
                  <Input
                    autoComplete="username"
                    aria-invalid={Boolean(errors.username)}
                    placeholder="请输入用户名"
                    {...register("username", {
                      required: "请输入用户名",
                    })}
                  />
                  <FieldError errors={[errors.username]} />
                </FieldContent>
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <FieldTitle>密码</FieldTitle>
                <FieldContent>
                  <PasswordInput
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    placeholder="请输入密码"
                    {...register("password", {
                      required: "请输入密码",
                    })}
                  />
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="pt-1">
              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {loginMutation.isPending ? "登录中..." : "登录"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
