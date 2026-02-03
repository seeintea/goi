import { createFileRoute, redirect } from "@tanstack/react-router"
import { Login } from "@/features/login"
import { useUser } from "@/stores"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { token, userId } = useUser.getState()
    if (token || userId) {
      throw redirect({ to: "/" })
    }
  },
  component: Login,
  staticData: {
    name: "登录",
    permission: "unauthed",
    icon: null,
  },
})
