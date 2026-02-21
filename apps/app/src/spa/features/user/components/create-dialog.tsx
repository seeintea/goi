import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateUser } from "@/api"
import { BaseDialog, DialogFooter } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { PasswordInput } from "@/components/base/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sha1Hex } from "@/utils/crypto"

type FormValues = {
  username: string
  password: string
  email: string
  phone: string
}

export function CreateDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const createUserMutation = useCreateUser()

  const defaultValues = useMemo<FormValues>(
    () => ({
      username: "",
      password: "",
      email: "",
      phone: "",
    }),
    [],
  )

  const form = useForm<FormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  const onSubmit = form.handleSubmit(async (values) => {
    createUserMutation.mutate(
      {
        username: values.username.trim(),
        password: await sha1Hex(values.password),
        email: values.email.trim() ? values.email.trim() : undefined,
        phone: values.phone.trim() ? values.phone.trim() : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
          onCreated?.()
        },
      },
    )
  })

  const isPending = createUserMutation.isPending

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
      title="新增用户"
      trigger={
        <Button>
          <Plus />
          新增用户
        </Button>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <FieldGroup>
          <FormField
            label="用户名"
            errors={[form.formState.errors.username]}
          >
            <Input
              {...form.register("username", { required: "请输入用户名" })}
              placeholder="请输入用户名"
            />
          </FormField>

          <FormField
            label="密码"
            errors={[form.formState.errors.password]}
          >
            <PasswordInput
              {...form.register("password", {
                required: "请输入密码",
                minLength: { value: 6, message: "密码至少 6 位" },
              })}
              placeholder="请输入密码"
            />
          </FormField>

          <FormField label="邮箱">
            <Input
              {...form.register("email")}
              placeholder="可选"
            />
          </FormField>

          <FormField label="手机">
            <Input
              {...form.register("phone")}
              placeholder="可选"
            />
          </FormField>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isPending}
          >
            创建
          </Button>
        </DialogFooter>
      </form>
    </BaseDialog>
  )
}
