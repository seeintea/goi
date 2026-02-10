import { createFileRoute } from "@tanstack/react-router"
import { Module } from "@/features/app/module"

export const Route = createFileRoute("/permission/module")({
  component: Module,
  staticData: {
    name: "模块管理",
    permission: "perm:module",
    icon: null,
    groupName: "权限管理",
  },
})
