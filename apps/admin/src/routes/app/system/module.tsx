import { createFileRoute } from "@tanstack/react-router"
import { ModuleList } from "@/features/app/system/module"

export const Route = createFileRoute("/app/system/module")({
  component: ModuleList,
  staticData: {
    name: "路由管理",
    permission: "app:system:module",
    menuType: "item",
  },
})
