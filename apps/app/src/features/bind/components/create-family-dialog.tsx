import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateFamily } from "@/api/queries/family"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type CreateFamilyFormValues = {
  name: string
  baseCurrency: string
  timezone: string
}

export function CreateFamilyDialog({ onCreated }: { onCreated: (familyId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const createFamilyMutation = useCreateFamily()

  const defaultValues = useMemo<CreateFamilyFormValues>(
    () => ({
      name: "",
      baseCurrency: "CNY",
      timezone: "Asia/Shanghai",
    }),
    [],
  )

  const form = useForm<CreateFamilyFormValues>({ defaultValues })

  useEffect(() => {
    if (!open) {
      setSubmitError("")
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError("")
    try {
      const family = await createFamilyMutation.mutateAsync({
        name: values.name.trim(),
        baseCurrency: values.baseCurrency.trim() || "CNY",
        timezone: values.timezone.trim() || "Asia/Shanghai",
      })

      setOpen(false)
      onCreated(family.id)
    } catch (error) {
      const e = error as Error
      setSubmitError(e.message || "创建失败")
    }
  })

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (createFamilyMutation.isPending) return
        setOpen(next)
      }}
      title="新建家庭"
      trigger={
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          新建家庭
        </Button>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <FieldError errors={submitError ? [{ message: submitError }] : undefined} />

        <FieldGroup>
          <FormField
            label="名称"
            errors={[form.formState.errors.name]}
          >
            <Input
              placeholder="请输入家庭名称"
              {...form.register("name", { required: "请输入名称" })}
            />
          </FormField>

          <FormField
            label="基础货币"
            errors={[form.formState.errors.baseCurrency]}
          >
            <Input
              placeholder="CNY"
              {...form.register("baseCurrency")}
            />
          </FormField>

          <FormField
            label="时区"
            errors={[form.formState.errors.timezone]}
          >
            <Input
              placeholder="Asia/Shanghai"
              {...form.register("timezone")}
            />
          </FormField>
        </FieldGroup>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={createFamilyMutation.isPending}
          >
            {createFamilyMutation.isPending ? "创建中..." : "创建"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
