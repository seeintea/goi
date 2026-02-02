import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Permission } from "@/api/controllers/permission"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormValues = {
  code: string
  name: string
  module: string
}

export function EditDialog({
  open,
  permission,
  isBusy,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  permission: Permission | null
  isBusy: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<FormValues>(() => {
    return {
      code: permission?.code ?? "",
      name: permission?.name ?? "",
      module: permission?.module ?? "",
    }
  }, [permission?.code, permission?.module, permission?.name])

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
          <DialogTitle>编辑权限</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>权限编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("code", { required: "请输入权限编码" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.code]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>权限名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("name")}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>模块</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("module")}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.module]} />
              </FieldContent>
            </Field>
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
      </DialogContent>
    </Dialog>
  )
}
