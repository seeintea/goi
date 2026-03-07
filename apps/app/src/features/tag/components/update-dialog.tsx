import type { Tag } from "@goi/contracts"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useUpdateTag } from "@/api/queries/tag"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UpdateTagFormValues = {
  name: string
  color: string
}

interface UpdateTagDialogProps {
  tag: Tag | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateTagDialog({ tag, open, onOpenChange }: UpdateTagDialogProps) {
  const updateTag = useUpdateTag()

  const form = useForm<UpdateTagFormValues>({
    defaultValues: {
      name: "",
      color: "",
    },
  })

  useEffect(() => {
    if (tag && open) {
      form.reset({
        name: tag.name,
        color: tag.color || "",
      })
    }
  }, [tag, open, form])

  const onSubmit = async (values: UpdateTagFormValues) => {
    if (!tag) return

    try {
      await updateTag.mutateAsync({
        id: tag.id,
        name: values.name,
        color: values.color || null,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update tag:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="编辑标签"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <FormField
            label="标签名称"
            errors={[form.formState.errors.name]}
          >
            <Input
              {...form.register("name", {
                required: "请输入标签名称",
                maxLength: { value: 50, message: "标签名称最多50个字符" },
              })}
              placeholder="请输入标签名称"
            />
          </FormField>

          <FormField
            label="颜色 (可选)"
            errors={[form.formState.errors.color]}
          >
            <div className="flex gap-2">
              <Input
                {...form.register("color", {
                  maxLength: { value: 20, message: "颜色代码最多20个字符" },
                })}
                placeholder="例如: #FF5733"
                className="flex-1"
              />
              <input
                type="color"
                className="h-10 w-10 p-0 border rounded cursor-pointer"
                {...form.register("color")}
              />
            </div>
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
            disabled={updateTag.isPending}
          >
            {updateTag.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
