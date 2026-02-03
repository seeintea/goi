import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Module } from "@/api/controllers/module"
import { BaseDialog } from "@/components/base/base-dialog"
import { ModuleFormFields, type ModuleFormValues } from "./create-dialog"

export function EditDialog({
  open,
  module,
  isBusy,
  parentOptions,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  module: Module | null
  isBusy: boolean
  parentOptions: { label: string; value: string }[]
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ModuleFormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<ModuleFormValues>(() => {
    return {
      name: module?.name ?? "",
      routePath: module?.routePath ?? "",
      permissionCode: module?.permissionCode ?? "",
      parentId: module?.parentId ?? "",
      sort: module?.sort ?? 0,
    }
  }, [module?.name, module?.permissionCode, module?.parentId, module?.routePath, module?.sort])

  const form = useForm<ModuleFormValues>({
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
      title="编辑模块"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <ModuleFormFields
          form={form}
          parentOptions={parentOptions}
          submitText="保存"
          submitDisabled={isBusy || !module}
        />
      </form>
    </BaseDialog>
  )
}
