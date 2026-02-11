import { createFileRoute } from "@tanstack/react-router"
import { User } from "lucide-react"
import { User as UserList } from "@/features/app/user"

export const Route = createFileRoute("/app/user")({
  component: UserList,
  staticData: {
    name: "用户管理",
    permission: "app:user",
    icon: <User size={16} />,
    menuType: "item",
  },
})
