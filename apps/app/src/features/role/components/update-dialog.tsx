import type { AppRole } from "@goi/contracts"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useUpdateRole } from "@/api/queries/role"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UpdateRoleFormValues = {
  roleName: string
  roleCode: string
}

interface UpdateRoleDialogProps {
  role: AppRole | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateRoleDialog({ role, open, onOpenChange }: UpdateRoleDialogProps) {
  const updateRole = useUpdateRole()

  const form = useForm<UpdateRoleFormValues>({
    defaultValues: {
      roleName: "",
      roleCode: "",
    },
  })

  useEffect(() => {
    if (role) {
      form.reset({
        roleName: role.roleName,
        roleCode: role.roleCode,
      })
    }
  }, [role, form])

  const onSubmit = async (values: UpdateRoleFormValues) => {
    if (!role) return
    try {
      await updateRole.mutateAsync({
        roleId: role.roleId,
        ...values,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="编辑角色"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <FormField
            label="角色编码"
            errors={[form.formState.errors.roleCode]}
          >
            <Input
              {...form.register("roleCode", { required: "请输入角色编码" })}
              placeholder="请输入角色编码"
            />
          </FormField>

          <FormField
            label="角色名称"
            errors={[form.formState.errors.roleName]}
          >
            <Input
              {...form.register("roleName", { required: "请输入角色名称" })}
              placeholder="请输入角色名称"
            />
          </FormField>
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={updateRole.isPending}
          >
            {updateRole.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
