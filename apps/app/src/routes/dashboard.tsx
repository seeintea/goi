import { createFileRoute, redirect } from "@tanstack/react-router"
import { LayoutDashboard } from "lucide-react"
import { Dashboard } from "@/features/dashboard"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" })
    }
  },
  head: () => ({
    meta: seo({
      title: "绑定",
      description: "绑定您的家庭",
    }),
  }),
  component: Dashboard,
  staticData: {
    name: "数据面板",
    permission: "dashboard",
    icon: <LayoutDashboard />,
  },
})
