import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Outlet,
  beforeLoad: () => {
    throw redirect({ to: "/user/list", replace: true })
  },
  staticData: {
    name: "",
    permission: "unauthed",
    icon: null,
  },
})
