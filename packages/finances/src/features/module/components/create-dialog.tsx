import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"

import { useCreateModule } from "@/api/react-query/module"
import { BaseDialog, DialogFooter } from "@/components/base-dialog"
import { FieldGroup, FormField } from "@/components/base-field"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type ModuleFormValues = {
  name: string
  routePath: string
  permissionCode: string
  parentId: string
  sort: number
}

export function ModuleFormFields({
  form,
  parentOptions,
  submitText,
  submitDisabled,
}: {
  form: UseFormReturn<ModuleFormValues>
  parentOptions: { label: string; value: string }[]
  submitText: string
  submitDisabled: boolean
}) {
  return (
    <>
      <FieldGroup>
        <FormField
          label="模块名称"
          errors={[form.formState.errors.name]}
        >
          <Input
            {...form.register("name", { required: "请输入模块名称" })}
            placeholder="例如：系统管理"
          />
        </FormField>

        <FormField
          label="前端路由路径"
          errors={[form.formState.errors.routePath]}
        >
          <Input
            {...form.register("routePath", { required: "请输入前端路由路径" })}
            placeholder="例如：/sys-manage/role"
          />
        </FormField>

        <FormField
          label="页面权限编码"
          errors={[form.formState.errors.permissionCode]}
        >
          <Input
            {...form.register("permissionCode", { required: "请输入页面权限编码" })}
            placeholder="例如：role / user / permission"
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
  parentOptions,
}: {
  onCreated?: () => void
  parentOptions: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)
  const createModuleMutation = useCreateModule()

  const defaultValues = useMemo<ModuleFormValues>(
    () => ({
      name: "",
      routePath: "",
      permissionCode: "",
      parentId: "",
      sort: 0,
    }),
    [],
  )

  const form = useForm<ModuleFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  const isPending = createModuleMutation.isPending

  const onSubmit = form.handleSubmit((values) => {
    const trimmedName = values.name.trim()
    const trimmedRoutePath = values.routePath.trim()
    const trimmedPermissionCode = values.permissionCode.trim()
    const parentId = values.parentId.trim() ? values.parentId.trim() : null
    const sort = Number.isFinite(values.sort) ? values.sort : undefined

    createModuleMutation.mutate(
      {
        name: trimmedName,
        routePath: trimmedRoutePath,
        permissionCode: trimmedPermissionCode,
        parentId,
        sort,
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
      title="新增模块"
      trigger={
        <Button>
          <Plus />
          新增模块
        </Button>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <ModuleFormFields
          form={form}
          parentOptions={parentOptions}
          submitText="创建"
          submitDisabled={isPending}
        />
      </form>
    </BaseDialog>
  )
}
