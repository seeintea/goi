import { createFileRoute, redirect } from "@tanstack/react-router"
import { Login } from "@/features/login/page"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.user?.userId) {
      throw redirect({ to: context.user.familyId ? "/dashboard" : "/" })
    }
  },
  component: Login,
  head: () => ({
    meta: seo({
      title: "登录",
      description: "登录您的账号",
    }),
  }),
})
