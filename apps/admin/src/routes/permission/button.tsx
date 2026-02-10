import { createFileRoute } from "@tanstack/react-router"
import { ButtonList } from "@/features/app/button-list"

export const Route = createFileRoute("/permission/button")({
  component: ButtonList,
  staticData: {
    name: "按钮管理",
    permission: "perm:button",
    icon: null,
    groupName: "权限管理",
  },
})
