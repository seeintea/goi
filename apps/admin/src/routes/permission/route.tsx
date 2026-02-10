import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Lock } from "lucide-react"

export const Route = createFileRoute("/permission")({
  component: Outlet,
  staticData: {
    name: "权限管理",
    permission: "permission",
    icon: <Lock size={16} />,
    groupName: "权限管理",
  },
})
