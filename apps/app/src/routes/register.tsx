import { createFileRoute, redirect } from "@tanstack/react-router"
import { Register } from "@/features/register/page"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: context.user.familyId ? "/dashboard" : "/" } as any)
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
