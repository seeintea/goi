import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateUser } from "@/api"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sha1Hex } from "@/lib/crypto"

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            新增用户
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增用户</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>用户名</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("username", { required: "请输入用户名" })}
                  placeholder="请输入用户名"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.username]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>密码</FieldLabel>
              <FieldContent>
                <PasswordInput
                  {...form.register("password", {
                    required: "请输入密码",
                    minLength: { value: 6, message: "密码至少 6 位" },
                  })}
                  placeholder="请输入密码"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>邮箱</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("email")}
                  placeholder="可选"
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>手机</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("phone")}
                  placeholder="可选"
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
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
      </DialogContent>
    </Dialog>
  )
}
