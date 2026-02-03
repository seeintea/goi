import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Module } from "@/api/controllers/module"
import { BaseDialog, DialogFooter } from "@/components/base-dialog"
import { FieldGroup, FormField } from "@/components/base-field"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FormValues = {
  name: string
  routePath: string
  permissionCode: string
  parentId: string
  sort: number
}

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
  onSubmit: (values: FormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<FormValues>(() => {
    return {
      name: module?.name ?? "",
      routePath: module?.routePath ?? "",
      permissionCode: module?.permissionCode ?? "",
      parentId: module?.parentId ?? "",
      sort: module?.sort ?? 0,
    }
  }, [module?.name, module?.permissionCode, module?.parentId, module?.routePath, module?.sort])

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
      title="编辑模块"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <FormField
            label="模块名称"
            errors={[form.formState.errors.name]}
          >
            <Input
              {...form.register("name", { required: "请输入模块名称" })}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="前端路由路径"
            errors={[form.formState.errors.routePath]}
          >
            <Input
              {...form.register("routePath", { required: "请输入前端路由路径" })}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="页面权限编码"
            errors={[form.formState.errors.permissionCode]}
          >
            <Input
              {...form.register("permissionCode", { required: "请输入页面权限编码" })}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="父模块"
            errors={[form.formState.errors.parentId]}
          >
            <input
              type="hidden"
              {...form.register("parentId")}
            />
            <Select
              options={parentOptions}
              value={form.watch("parentId")}
              onValueChange={(next) => {
                form.setValue("parentId", String(next), { shouldValidate: true })
              }}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="排序"
            errors={[form.formState.errors.sort]}
          >
            <Input
              type="number"
              min={0}
              step={1}
              {...form.register("sort", { valueAsNumber: true })}
              disabled={isBusy}
            />
          </FormField>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isBusy || !module}
          >
            保存
          </Button>
        </DialogFooter>
      </form>
    </BaseDialog>
  )
}
