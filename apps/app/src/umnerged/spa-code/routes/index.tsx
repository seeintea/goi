import { createFileRoute, redirect } from "@tanstack/react-router"
import { App } from "@/features/app"
import { useUser } from "@/stores"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { token, bookId } = useUser.getState()
    if (!token) {
      throw redirect({ to: "/login", replace: true })
    }
    if (bookId) {
      throw redirect({ to: "/dashboard", replace: true })
    }
  },
  component: App,
  staticData: {
    name: "绑定",
    permission: "unauthed",
    icon: null,
  },
})
