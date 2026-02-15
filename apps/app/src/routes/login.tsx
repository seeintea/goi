import { createFileRoute, redirect } from "@tanstack/react-router"
import { Login } from "@/features/login/page"

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.user?.userId) {
      throw redirect({ to: context.user.familyId ? "/dashboard" : "/" })
    }
  },
  component: Login,
})
