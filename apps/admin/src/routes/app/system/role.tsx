import { createFileRoute } from "@tanstack/react-router"
import { RoleList } from "@/features/app/system/role"

export const Route = createFileRoute("/app/system/role")({
  component: RoleList,
  staticData: {
    name: "角色管理",
    permission: "app:system:role",
    menuType: "item",
  },
})
