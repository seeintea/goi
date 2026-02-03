import { useCreateBook } from "@/api"
import { BaseDialog, DialogFooter } from "@/components/base-dialog"
import { FieldGroup, FormField } from "@/components/base-field"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

type CreateBookFormValues = {
  name: string
  currency: string
  timezone: string
}

export function CreateBookDialog({ ownerUserId, onCreated }: { ownerUserId: string; onCreated: (bookId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const createBookMutation = useCreateBook()

  const defaultValues = useMemo<CreateBookFormValues>(
    () => ({
      name: "",
      currency: "",
      timezone: "",
    }),
    [],
  )

  const form = useForm<CreateBookFormValues>({ defaultValues })

  useEffect(() => {
    if (!open) {
      setSubmitError("")
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError("")
    try {
      const book = await createBookMutation.mutateAsync({
        name: values.name.trim(),
        currency: values.currency.trim() ? values.currency.trim() : undefined,
        timezone: values.timezone.trim() ? values.timezone.trim() : undefined,
        ownerUserId,
      })
      setOpen(false)
      onCreated(book.bookId)
    } catch (error) {
      const e = error as Error
      setSubmitError(e.message || "创建失败")
    }
  })

  const isPending = createBookMutation.isPending

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
      title="新建书符"
      trigger={
        <Button
          variant="outline"
          disabled={!ownerUserId}
        >
          <Plus />
          新建书符
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
              placeholder="请输入书符名称"
              {...form.register("name", { required: "请输入名称" })}
            />
          </FormField>

          <FormField
            label="货币"
            errors={[form.formState.errors.currency]}
          >
            <Input
              placeholder="可选，例如：CNY"
              {...form.register("currency")}
            />
          </FormField>

          <FormField
            label="时区"
            errors={[form.formState.errors.timezone]}
          >
            <Input
              placeholder="可选，例如：Asia/Shanghai"
              {...form.register("timezone")}
            />
          </FormField>
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
    </BaseDialog>
  )
}
