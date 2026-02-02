import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { Role } from "@/api/controllers/role"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>角色编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("roleCode", { required: "请输入角色编码" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.roleCode]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>角色名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("roleName", { required: "请输入角色名称" })}
                  disabled={isBusy}
                />
                <FieldError errors={[form.formState.errors.roleName]} />
              </FieldContent>
            </Field>
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
      </DialogContent>
    </Dialog>
  )
}

