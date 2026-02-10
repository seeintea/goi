import { createFileRoute, Outlet } from "@tanstack/react-router"
import { User } from "lucide-react"

export const Route = createFileRoute("/user")({
  component: Outlet,
  staticData: {
    name: "用户管理",
    permission: "user",
    icon: <User size={16} />,
    groupName: "用户管理",
  },
})
