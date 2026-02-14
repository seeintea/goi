import { createFileRoute, redirect } from "@tanstack/react-router"
import { Login } from "@/features/login/page"

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    console.log(context.user)
    if (context.user?.userId) {
      throw redirect({ to: context.user.bookId ? "/dashboard" : "/" } as any)
    }
  },
  component: Login,
})
