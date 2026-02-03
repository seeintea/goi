import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Role } from "@/api/controllers/role"
import { BaseDialog } from "@/components/base/base-dialog"
import { RoleFormFields, type RoleFormValues } from "./create-dialog"

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
  onSubmit: (values: RoleFormValues) => void | Promise<void>
}) {
  const defaultValues = useMemo<RoleFormValues>(() => {
    return {
      roleCode: role?.roleCode ?? "",
      roleName: role?.roleName ?? "",
    }
  }, [role?.roleCode, role?.roleName])

  const form = useForm<RoleFormValues>({
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
        <RoleFormFields
          form={form}
          submitText="保存"
          submitDisabled={isBusy || !role}
        />
      </form>
    </BaseDialog>
  )
}
