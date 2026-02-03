import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Permission } from "@/api/controllers/permission"
import { BaseDialog } from "@/components/base/base-dialog"
import { PermissionFormFields, type PermissionFormValues } from "./create-dialog"

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
  onSubmit: (values: PermissionFormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<PermissionFormValues>(() => {
    return {
      code: permission?.code ?? "",
      name: permission?.name ?? "",
      moduleId: permission?.moduleId ?? "",
    }
  }, [permission?.code, permission?.moduleId, permission?.name])

  const form = useForm<PermissionFormValues>({
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
        <PermissionFormFields
          form={form}
          moduleOptions={moduleOptions}
          submitText="保存"
          submitDisabled={isBusy || !permission}
        />
      </form>
    </BaseDialog>
  )
}
