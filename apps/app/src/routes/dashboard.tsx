import { createFileRoute, redirect } from "@tanstack/react-router"
import { Dashboard } from "@/features/dashboard"
import { seo } from "@/utils/seo"

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
})
