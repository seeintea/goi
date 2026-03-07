import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useCreateTag } from "@/api/queries/tag"
import { BaseDialog } from "@/components/base/base-dialog"
import { FieldGroup, FormField } from "@/components/base/base-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@/stores/useUser"

type CreateTagFormValues = {
  name: string
  color: string
}

export function CreateTagDialog() {
  const [open, setOpen] = useState(false)
  const createTag = useCreateTag()
  const familyId = useUser((s) => s.familyId)

  const form = useForm<CreateTagFormValues>({
    defaultValues: {
      name: "",
      color: "",
    },
  })

  const onSubmit = async (values: CreateTagFormValues) => {
    if (!familyId) return

    try {
      await createTag.mutateAsync({
        ...values,
        familyId,
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create tag:", error)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={setOpen}
      title="创建标签"
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      }
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
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={createTag.isPending}
          >
            {createTag.isPending ? "创建中..." : "创建"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
