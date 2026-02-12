import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/sys-manage")({
  component: Outlet,
  staticData: {
    name: "系统管理",
    permission: "unauthed",
    icon: null,
  },
})
