import { createRootRoute, redirect } from "@tanstack/react-router"
import { Layout } from "@/layout"
import { useUser } from "@/stores"

export const Route = createRootRoute({
  component: Layout,
  beforeLoad: ({ location }) => {
    const { token } = useUser.getState()
    const pathname = location.pathname

    if (!token && pathname !== "/login") {
      throw redirect({ to: "/login", replace: true })
    }
  },
  staticData: {
    name: "",
    permission: "unauthed",
    icon: null,
  },
})
