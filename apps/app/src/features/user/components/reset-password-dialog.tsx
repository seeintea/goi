import type { AppUser } from "@goi/contracts"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useResetPassword } from "@/api/queries/user"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ResetPasswordFormValues = {
  password: string
}

type ResetPasswordDialogProps = {
  user: AppUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>()

  useEffect(() => {
    if (open) {
      reset({ password: "" })
    }
  }, [open, reset])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!user) return

    try {
      await resetPassword.mutateAsync({
        userId: user.userId,
        password: values.password,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to reset password:", error)
    }
  }

  if (!user) return null

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`重置密码: ${user.username}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <FormField label="新密码" errors={[errors.password]}>
            <Input
              {...register("password", { required: "请输入新密码", minLength: { value: 6, message: "密码至少6位" } })}
              type="password"
              placeholder="请输入新密码"
            />
          </FormField>
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
