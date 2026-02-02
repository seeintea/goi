import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateRole } from "@/api/react-query/role"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormValues = {
  roleCode: string
  roleName: string
}

export function CreateDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const createRoleMutation = useCreateRole()

  const defaultValues = useMemo<FormValues>(
    () => ({
      roleCode: "",
      roleName: "",
    }),
    [],
  )

  const form = useForm<FormValues>({
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            新增角色
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增角色</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>角色编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("roleCode", { required: "请输入角色编码" })}
                  placeholder="例如：Owner / Member"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.roleCode]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>角色名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("roleName", { required: "请输入角色名称" })}
                  placeholder="例如：拥有者 / 成员"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.roleName]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

