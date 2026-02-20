import { createFileRoute, redirect } from "@tanstack/react-router"
import { AppPage } from "@/features/app/pages/app-page"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: "/login",
        replace: true,
      })
    }
    if (context.user.familyId) {
      throw redirect({
        to: "/dashboard" as any,
        replace: true,
      })
    }
  },
  head: () => ({
    meta: seo({
      title: "家庭",
      description: "绑定或创建您的家庭",
    }),
  }),
  component: AppPage,
})
