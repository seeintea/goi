import { createFileRoute } from "@tanstack/react-router"
import { Tag } from "@/features/tag"
import { seo } from "@/utils/seo"

export const Route = createFileRoute("/system/tag")({
  component: Tag,
  head: () => ({
    meta: seo({
      title: "标签管理",
      description: "管理财务标签",
    }),
  }),
})
