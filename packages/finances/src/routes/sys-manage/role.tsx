import { createFileRoute } from "@tanstack/react-router"
import { SquareUser } from "lucide-react"
import { UserList } from "@/features/UserList"

export const Route = createFileRoute("/sys-manage/role")({
  component: UserList,
  staticData: {
    name: "角色管理",
    permission: "role",
    icon: <SquareUser />,
    groupName: "系统管理",
  },
})
