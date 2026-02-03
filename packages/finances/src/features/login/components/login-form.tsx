import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { FieldGroup, FormField } from "@/components/base-field"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LoginFormValues = {
  username: string
  password: string
}

export function LoginForm({
  onSubmit,
  isPending,
  prefillUsername,
}: {
  onSubmit: (values: LoginFormValues) => Promise<void>
  isPending: boolean
  prefillUsername: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    if (!prefillUsername) return
    reset({
      username: prefillUsername,
      password: "",
    })
  }, [prefillUsername, reset])

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <FormField
          label="用户名"
          data-invalid={Boolean(errors.username)}
          errors={[errors.username]}
        >
          <Input
            autoComplete="username"
            aria-invalid={Boolean(errors.username)}
            placeholder="请输入用户名"
            {...register("username", {
              required: "请输入用户名",
            })}
          />
        </FormField>

        <FormField
          label="密码"
          data-invalid={Boolean(errors.password)}
          errors={[errors.password]}
        >
          <PasswordInput
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            placeholder="请输入密码"
            {...register("password", {
              required: "请输入密码",
            })}
          />
        </FormField>
      </FieldGroup>

      <div className="pt-1">
        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "登录中..." : "登录"}
        </Button>
      </div>
    </form>
  )
}
