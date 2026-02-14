import { createFileRoute, redirect } from "@tanstack/react-router"
import { Register } from "@/features/register/page"

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: context.user.familyId ? "/dashboard" : "/" } as any)
    }
  },
  component: Register,
})
