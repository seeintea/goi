import { createFileRoute } from "@tanstack/react-router"
import { Register } from "@/features/register/page"

export const Route = createFileRoute("/register")({
  component: Register,
})
