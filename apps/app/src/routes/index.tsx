import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: () => {
    return "tanstack-router ssr"
  },
  staticData: {
    name: "绑定",
    permission: "unauthed",
    icon: null,
  },
})
