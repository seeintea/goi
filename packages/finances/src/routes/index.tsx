import { createFileRoute } from "@tanstack/react-router"
import { LayoutDashboard } from "lucide-react"

export const Route = createFileRoute("/")({
  component: App,
  staticData: {
    name: "数据面板",
    permission: "dashboard",
    icon: <LayoutDashboard />,
  },
})

function App() {
  return null
}
