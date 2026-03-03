import { createFileRoute } from "@tanstack/react-router"
import { User } from "@/features/user"
import { seo } from "@/utils/seo"

export const Route = createFileRoute("/system/user")({
  component: User,
  head: () => ({
    meta: seo({
      title: "用户管理",
      description: "管理用户",
    }),
  }),
})
