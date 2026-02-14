import { createFileRoute } from "@tanstack/react-router"
import { Login } from "@/features/login/page"

export const Route = createFileRoute("/login")({
  component: Login,
})
