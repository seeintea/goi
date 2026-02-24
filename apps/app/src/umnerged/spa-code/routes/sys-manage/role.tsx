import { createFileRoute } from "@tanstack/react-router"
import { SquareUser } from "lucide-react"
import { Role } from "@/features/role"

export const Route = createFileRoute("/sys-manage/role")({
  component: Role,
  staticData: {
    name: "角色管理",
    permission: "role",
    icon: <SquareUser />,
    groupName: "系统管理",
  },
})
