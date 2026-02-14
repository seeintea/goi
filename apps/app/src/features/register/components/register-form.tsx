import { useForm } from "react-hook-form"

import { FieldGroup, FormField } from "@/components/base/base-field"
import { PasswordInput } from "@/components/base/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type RegisterFormValues = {
  username: string
  password: string
  confirmPassword: string
  email: string
  phone: string
}

export function RegisterForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: RegisterFormValues) => Promise<void>
  isPending: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
    },
    mode: "onSubmit",
  })

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
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            placeholder="请输入密码"
            {...register("password", {
              required: "请输入密码",
            })}
          />
        </FormField>

        <FormField
          label="确认密码"
          data-invalid={Boolean(errors.confirmPassword)}
          errors={[errors.confirmPassword]}
        >
          <PasswordInput
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            placeholder="请再次输入密码"
            {...register("confirmPassword", {
              required: "请再次输入密码",
              validate: (value) => {
                const password = getValues("password")
                if (value === password) return true
                return "两次输入的密码不一致"
              },
            })}
          />
        </FormField>

        <FormField
          label="邮箱"
          data-invalid={Boolean(errors.email)}
          errors={[errors.email]}
        >
          <Input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            placeholder="请输入邮箱（选填）"
            {...register("email")}
          />
        </FormField>

        <FormField
          label="手机号"
          data-invalid={Boolean(errors.phone)}
          errors={[errors.phone]}
        >
          <Input
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            placeholder="请输入手机号（选填）"
            {...register("phone")}
          />
        </FormField>
      </FieldGroup>

      <div className="pt-1">
        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "注册中..." : "注册"}
        </Button>
      </div>
    </form>
  )
}
