import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/features/app/button"

export const Route = createFileRoute("/permission/button")({
  component: Button,
  staticData: {
    name: "按钮管理",
    permission: "perm:button",
    icon: null,
    groupName: "权限管理",
  },
})
