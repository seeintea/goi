import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Module } from "@/api/controllers/module"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑模块</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>模块名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("name", { required: "请输入模块名称" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>前端路由路径</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("routePath", { required: "请输入前端路由路径" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.routePath]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>页面权限编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("permissionCode", { required: "请输入页面权限编码" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.permissionCode]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>父模块</FieldLabel>
              <FieldContent>
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
                <FieldError errors={[form.formState.errors.parentId]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>排序</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...form.register("sort", { valueAsNumber: true })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.sort]} />
              </FieldContent>
            </Field>
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
      </DialogContent>
    </Dialog>
  )
}
