import { createFileRoute } from "@tanstack/react-router"
import { User as UserIcon } from "lucide-react"
import { User } from "@/features/user"

export const Route = createFileRoute("/sys-manage/user")({
  component: User,
  staticData: {
    name: "用户管理",
    permission: "user",
    icon: <UserIcon />,
    groupName: "系统管理",
  },
})
