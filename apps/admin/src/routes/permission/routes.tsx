import { createFileRoute } from "@tanstack/react-router"
import { RoutesList } from "@/features/app/routes-list"

export const Route = createFileRoute("/permission/routes")({
  component: RoutesList,
  staticData: {
    name: "路由管理",
    permission: "perm:routes",
    icon: null,
    groupName: "权限管理",
  },
})
