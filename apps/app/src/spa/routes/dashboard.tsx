import { createFileRoute } from "@tanstack/react-router"
import { LayoutDashboard } from "lucide-react"
import { Dashboard } from "@/features/dashboard"

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  staticData: {
    name: "数据面板",
    permission: "dashboard",
    icon: <LayoutDashboard />,
  },
})
