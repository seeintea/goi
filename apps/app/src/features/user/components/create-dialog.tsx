import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateUser } from "@/api/queries/user"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@/stores/useUser"

type CreateUserFormValues = {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
  familyId?: string
}

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const createUser = useCreateUser()
  const familyId = useUser((s) => s.familyId)

  const form = useForm<CreateUserFormValues>({
    defaultValues: {
      username: "",
      password: "",
      nickname: "",
      email: "",
      phone: "",
      familyId: "",
    },
  })

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser.mutateAsync({
        ...values,
        isVirtual: true,
        familyId: familyId ?? "",
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={setOpen}
      title="创建用户"
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建用户
        </Button>
      }
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
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
            <Input
              type="password"
              {...form.register("password", { required: "请输入密码" })}
              placeholder="请输入密码"
            />
          </FormField>

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
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={createUser.isPending}
          >
            {createUser.isPending ? "创建中..." : "创建"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
