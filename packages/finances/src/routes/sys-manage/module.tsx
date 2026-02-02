import { createFileRoute } from "@tanstack/react-router"
import { Package } from "lucide-react"
import { Module } from "@/features/module"

export const Route = createFileRoute("/sys-manage/module")({
  component: Module,
  staticData: {
    name: "模块管理",
    permission: "module",
    icon: <Package />,
    groupName: "系统管理",
  },
})
