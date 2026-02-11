import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Lock } from "lucide-react"

export const Route = createFileRoute("/app/system")({
  component: Outlet,
  staticData: {
    name: "权限管理",
    permission: "app:system",
    icon: <Lock size={16} />,
    menuType: "group",
  },
})
