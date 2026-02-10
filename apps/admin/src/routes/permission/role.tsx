import { createFileRoute } from "@tanstack/react-router"
import { Role } from "@/features/app/role"

export const Route = createFileRoute("/permission/role")({
  component: Role,
  staticData: {
    name: "角色管理",
    permission: "perm:role",
    icon: null,
    groupName: "权限管理",
  },
})
