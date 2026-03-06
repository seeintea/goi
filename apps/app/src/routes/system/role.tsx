import { createFileRoute } from "@tanstack/react-router"
import { Role } from "@/features/role"
import { seo } from "@/utils/seo"

export const Route = createFileRoute("/system/role")({
  component: Role,
  head: () => ({
    meta: seo({
      title: "角色管理",
      description: "管理角色",
    }),
  }),
})
