import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateModule } from "@/api/react-query/module"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormValues = {
  name: string
  routePath: string
  permissionCode: string
  parentId: string
  sort: number
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

  const defaultValues = useMemo<FormValues>(
    () => ({
      name: "",
      routePath: "",
      permissionCode: "",
      parentId: "",
      sort: 0,
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
            新增模块
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增模块</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>模块名称</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("name", { required: "请输入模块名称" })}
                  placeholder="例如：系统管理"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>前端路由路径</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("routePath", { required: "请输入前端路由路径" })}
                  placeholder="例如：/sys-manage/role"
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.routePath]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>页面权限编码</FieldLabel>
              <FieldContent>
                <Input
                  {...form.register("permissionCode", { required: "请输入页面权限编码" })}
                  placeholder="例如：role / user / permission"
                  disabled={isPending}
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
                  disabled={isPending}
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
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.sort]} />
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

