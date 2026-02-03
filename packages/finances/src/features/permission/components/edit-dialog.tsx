import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Permission } from "@/api/controllers/permission"
import { BaseDialog, DialogFooter } from "@/components/base-dialog"
import { FieldGroup, FormField } from "@/components/base-field"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FormValues = {
  code: string
  name: string
  moduleId: string
}

export function EditDialog({
  open,
  permission,
  isBusy,
  moduleOptions,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  permission: Permission | null
  isBusy: boolean
  moduleOptions: { label: string; value: string }[]
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<FormValues>(() => {
    return {
      code: permission?.code ?? "",
      name: permission?.name ?? "",
      moduleId: permission?.moduleId ?? "",
    }
  }, [permission?.code, permission?.moduleId, permission?.name])

  const form = useForm<FormValues>({
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return
        onOpenChange(next)
      }}
      title="编辑权限"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <FormField
            label="权限编码"
            errors={[form.formState.errors.code]}
          >
            <Input
              {...form.register("code", { required: "请输入权限编码" })}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="权限名称"
            errors={[form.formState.errors.name]}
          >
            <Input
              {...form.register("name")}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="模块"
            errors={[form.formState.errors.moduleId]}
          >
            <input
              type="hidden"
              {...form.register("moduleId")}
            />
            <Select
              options={moduleOptions}
              value={form.watch("moduleId")}
              onValueChange={(next) => {
                form.setValue("moduleId", String(next), { shouldValidate: true })
              }}
              disabled={isBusy}
            />
          </FormField>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isBusy || !permission}
          >
            保存
          </Button>
        </DialogFooter>
      </form>
    </BaseDialog>
  )
}
