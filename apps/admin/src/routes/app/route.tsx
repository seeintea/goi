import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/app")({
  component: Outlet,
  staticData: {
    name: "APP",
    permission: "unauthed",
    menuType: "flatten",
  },
})
