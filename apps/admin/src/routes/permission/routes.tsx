import { createFileRoute } from "@tanstack/react-router"
import { Routes } from "@/features/app/routes"

export const Route = createFileRoute("/permission/routes")({
  component: Routes,
  staticData: {
    name: "路由管理",
    permission: "perm:routes",
    icon: null,
    groupName: "权限管理",
  },
})
