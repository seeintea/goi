import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateRole } from "@/api/queries/role"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@/stores/useUser"

type CreateRoleFormValues = {
  roleName: string
  roleCode: string
}

export function CreateRoleDialog() {
  const [open, setOpen] = useState(false)
  const createRole = useCreateRole()
  const familyId = useUser((s) => s.familyId)

  const form = useForm<CreateRoleFormValues>({
    defaultValues: {
      roleName: "",
      roleCode: "",
    },
  })

  const onSubmit = async (values: CreateRoleFormValues) => {
    try {
      await createRole.mutateAsync({
        ...values,
        familyId: familyId || null,
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create role:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={setOpen}
      title="创建角色"
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建角色
        </Button>
      }
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
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={createRole.isPending}
          >
            {createRole.isPending ? "创建中..." : "创建"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
