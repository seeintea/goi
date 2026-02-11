import { createFileRoute } from "@tanstack/react-router"
import { User } from "lucide-react"

export const Route = createFileRoute("/admin/user")({
  component: RouteComponent,
  staticData: {
    name: "用户管理",
    permission: "admin:user",
    icon: <User size={16} />,
    menuType: "item",
  },
})

function RouteComponent() {
  return <div>Hello "/admin/user"!</div>
}
