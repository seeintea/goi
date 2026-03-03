import type { AppUser } from "@goi/contracts"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useUpdateUser } from "@/api/queries/user"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UpdateUserFormValues = {
  nickname?: string
  email?: string
  phone?: string
}

type UpdateUserDialogProps = {
  user: AppUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateUserDialog({ user, open, onOpenChange }: UpdateUserDialogProps) {
  const updateUser = useUpdateUser()

  const form = useForm<UpdateUserFormValues>()

  useEffect(() => {
    if (user && open) {
      form.reset({
        nickname: user.nickname || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user, open, form])

  const onSubmit = async (values: UpdateUserFormValues) => {
    if (!user) return

    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        ...values,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`编辑用户: ${user?.username}`}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <FormField
            label="昵称"
            errors={[form.formState.errors.nickname]}
          >
            <Input
              {...form.register("nickname")}
              placeholder="请输入昵称"
            />
          </FormField>

          <FormField
            label="邮箱"
            errors={[form.formState.errors.email]}
          >
            <Input
              type="email"
              {...form.register("email")}
              placeholder="请输入邮箱"
            />
          </FormField>

          <FormField
            label="手机号"
            errors={[form.formState.errors.phone]}
          >
            <Input
              {...form.register("phone")}
              placeholder="请输入手机号"
            />
          </FormField>
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
