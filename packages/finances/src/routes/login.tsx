import { createFileRoute } from "@tanstack/react-router"
import { Login } from "@/features/Login"

export const Route = createFileRoute("/login")({
  component: Login,
  staticData: {
    name: "登录",
    permission: "unauthed",
    icon: null,
  },
})
