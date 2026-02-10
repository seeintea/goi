import { createFileRoute } from "@tanstack/react-router"
import { UserList } from "@/features/app/user-list"

export const Route = createFileRoute("/user/list")({
  component: UserList,
  staticData: {
    name: "用户列表",
    permission: "user:list",
    icon: null,
    groupName: "用户管理",
  },
})
