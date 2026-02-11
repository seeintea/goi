import { createFileRoute } from "@tanstack/react-router"
import { PermissionList } from "@/features/app/system/permission"

export const Route = createFileRoute("/app/system/permission")({
  component: PermissionList,
  staticData: {
    name: "按钮管理",
    permission: "app:system:permission",
    menuType: "item",
  },
})
