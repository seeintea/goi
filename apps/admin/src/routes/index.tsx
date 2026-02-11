import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Outlet,
  beforeLoad: () => {
    throw redirect({ to: "/app/user", replace: true })
  },
  staticData: {
    name: "",
    permission: "unauthed",
    menuType: "hidden",
  },
})
