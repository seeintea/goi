import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useCreatePermission } from "@/api/react-query/permission"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormValues = {
  code: string
  name: string
  moduleId: string
}

export function CreateDialog({
  onCreated,
  moduleOptions,
}: {
  onCreated?: () => void
  moduleOptions: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)
  const createPermissionMutation = useCreatePermission()

  const defaultValues = useMemo<FormValues>(
    () => ({
      code: "",
      name: "",
      moduleId: "",
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

  const isPending = createPermissionMutation.isPending

  const onSubmit = form.handleSubmit((values) => {
    createPermissionMutation.mutate(
      {
        code: values.code.trim(),
        name: values.name.trim() ? values.name.trim() : undefined,
        moduleId: values.moduleId.trim(),
      },
      {
        onSuccess: () => {
          setOpen(false)
          onCreated?.()
        },
      },
    )
  })

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
            新增权限
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增权限</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>权限编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("code", { required: "请输入权限编码" })}
                  placeholder="例如：role / user / permission"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.code]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>权限名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("name")}
                  placeholder="例如：角色管理"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>模块</FieldLabel>
              <FieldContent>
                <input
                  type="hidden"
                  {...form.register("moduleId", { required: "请选择模块" })}
                />
                <Select
                  options={moduleOptions}
                  value={form.watch("moduleId")}
                  onValueChange={(next) => {
                    form.setValue("moduleId", String(next), { shouldValidate: true })
                  }}
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.moduleId]} />
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
