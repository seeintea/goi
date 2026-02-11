import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/admin")({
  component: Outlet,
  staticData: {
    name: "ADMIN",
    permission: "unauthed",
    menuType: "flatten",
  },
})
