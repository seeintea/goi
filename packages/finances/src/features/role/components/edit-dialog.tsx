import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Role } from "@/api/controllers/role"
import { BaseDialog, DialogFooter } from "@/components/base-dialog"
import { FieldGroup, FormField } from "@/components/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FormValues = {
  roleCode: string
  roleName: string
}

export function EditDialog({
  open,
  role,
  isBusy,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  role: Role | null
  isBusy: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<FormValues>(() => {
    return {
      roleCode: role?.roleCode ?? "",
      roleName: role?.roleName ?? "",
    }
  }, [role?.roleCode, role?.roleName])

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
      title="编辑角色"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <FormField
            label="角色编码"
            errors={[form.formState.errors.roleCode]}
          >
            <Input
              {...form.register("roleCode", { required: "请输入角色编码" })}
              disabled={isBusy}
            />
          </FormField>

          <FormField
            label="角色名称"
            errors={[form.formState.errors.roleName]}
          >
            <Input
              {...form.register("roleName", { required: "请输入角色名称" })}
              disabled={isBusy}
            />
          </FormField>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isBusy || !role}
          >
            保存
          </Button>
        </DialogFooter>
      </form>
    </BaseDialog>
  )
}
