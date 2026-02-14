import { createFileRoute, redirect } from "@tanstack/react-router"
import { LayoutDashboard } from "lucide-react"
import { Dashboard } from "@/features/dashboard/page"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" })
    }
  },
  component: Dashboard,
  staticData: {
    name: "数据面板",
    permission: "dashboard",
    icon: <LayoutDashboard />,
  },
})
