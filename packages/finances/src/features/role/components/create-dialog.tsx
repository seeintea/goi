import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"

import { useCreateRole } from "@/api/react-query/role"
import { BaseDialog, DialogFooter } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type RoleFormValues = {
  roleCode: string
  roleName: string
}

export function RoleFormFields({
  form,
  submitText,
  submitDisabled,
}: {
  form: UseFormReturn<RoleFormValues>
  submitText: string
  submitDisabled: boolean
}) {
  return (
    <>
      <FieldGroup>
        <FormField
          label="角色编码"
          errors={[form.formState.errors.roleCode]}
        >
          <Input
            {...form.register("roleCode", { required: "请输入角色编码" })}
            placeholder="例如：Owner / Member"
          />
        </FormField>

        <FormField
          label="角色名称"
          errors={[form.formState.errors.roleName]}
        >
          <Input
            {...form.register("roleName", { required: "请输入角色名称" })}
            placeholder="例如：拥有者 / 成员"
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

export function CreateDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const createRoleMutation = useCreateRole()

  const defaultValues = useMemo<RoleFormValues>(
    () => ({
      roleCode: "",
      roleName: "",
    }),
    [],
  )

  const form = useForm<RoleFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  const isPending = createRoleMutation.isPending

  const onSubmit = form.handleSubmit((values) => {
    createRoleMutation.mutate(
      {
        roleCode: values.roleCode.trim(),
        roleName: values.roleName.trim(),
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
      title="新增角色"
      trigger={
        <Button>
          <Plus />
          新增角色
        </Button>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <RoleFormFields
          form={form}
          submitText="创建"
          submitDisabled={isPending}
        />
      </form>
    </BaseDialog>
  )
}
