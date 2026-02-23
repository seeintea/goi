import { createFileRoute, redirect } from "@tanstack/react-router"
import { Register } from "@/features/register"
import { seo } from "@/utils/seo"

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: context.user.familyId ? "/dashboard" : "/" })
    }
  },
  component: Register,
  head: () => ({
    meta: seo({
      title: "注册",
      description: "注册您的账号",
    }),
  }),
})
