import { createFileRoute } from "@tanstack/react-router"
import { FingerprintPattern } from "lucide-react"
import { Permission } from "@/features/permission"

export const Route = createFileRoute("/sys-manage/permission")({
  component: Permission,
  staticData: {
    name: "权限管理",
    permission: "permission",
    icon: <FingerprintPattern />,
    groupName: "系统管理",
  },
})
