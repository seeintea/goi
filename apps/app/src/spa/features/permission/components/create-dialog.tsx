import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"

import { useCreatePermission } from "@/api"
import { BaseDialog, DialogFooter } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Select } from "@/components/base/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type PermissionFormValues = {
  code: string
  name: string
  moduleId: string
}

export function PermissionFormFields({
  form,
  moduleOptions,
  submitText,
  submitDisabled,
}: {
  form: UseFormReturn<PermissionFormValues>
  moduleOptions: { label: string; value: string }[]
  submitText: string
  submitDisabled: boolean
}) {
  return (
    <>
      <FieldGroup>
        <FormField
          label="权限编码"
          errors={[form.formState.errors.code]}
        >
          <Input
            {...form.register("code", { required: "请输入权限编码" })}
            placeholder="例如：role / user / permission"
          />
        </FormField>

        <FormField
          label="权限名称"
          errors={[form.formState.errors.name]}
        >
          <Input
            {...form.register("name")}
            placeholder="例如：角色管理"
          />
        </FormField>

        <FormField
          label="模块"
          errors={[form.formState.errors.moduleId]}
        >
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
          />
        </FormField>
      </FieldGroup>

      <DialogFooter>
        <Button
          type="submit"
          disabled={submitDisabled}
        >
          {submitText}
        </Button>
      </DialogFooter>
    </>
  )
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

  const defaultValues = useMemo<PermissionFormValues>(
    () => ({
      code: "",
      name: "",
      moduleId: "",
    }),
    [],
  )

  const form = useForm<PermissionFormValues>({
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
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
      title="新增权限"
      trigger={
        <Button>
          <Plus />
          新增权限
        </Button>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <PermissionFormFields
          form={form}
          moduleOptions={moduleOptions}
          submitText="创建"
          submitDisabled={isPending}
        />
      </form>
    </BaseDialog>
  )
}
