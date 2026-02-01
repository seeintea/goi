import { createFileRoute } from "@tanstack/react-router"
import { User } from "lucide-react"
import { UserList } from "@/features/UserList"

export const Route = createFileRoute("/sys-manage/user")({
  component: UserList,
  staticData: {
    name: "用户管理",
    permission: "user",
    icon: <User />,
    groupName: "系统管理",
  },
})
