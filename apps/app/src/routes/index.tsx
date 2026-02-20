import { createFileRoute, redirect } from "@tanstack/react-router"
import { Bind } from "@/features/bind"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    console.log(context)
    if (!context.user?.userId) {
      throw redirect({
        to: "/login",
        replace: true,
      })
    }
    if (context.user.familyId) {
      throw redirect({
        to: "/dashboard",
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
  component: Bind,
})
