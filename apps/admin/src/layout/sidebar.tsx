import { DashboardOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { Menu } from "antd"
import { useSidebar } from "@/stores"
import { cn } from "@/utils/cn"

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isOpen = useSidebar((s) => s.isOpen)

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col sticky top-0",
        isOpen ? "w-54" : "w-16",
      )}
    >
      <div className="h-14 flex items-center justify-center border-b border-gray-100 shrink-0">
        {isOpen ? (
          <span className="font-bold text-lg">账簿 - 运营后台</span>
        ) : (
          <span className="font-bold text-lg">账</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          inlineCollapsed={!isOpen}
          inlineIndent={12}
          onClick={({ key }) => navigate({ to: key })}
          items={[
            {
              key: "/",
              icon: <DashboardOutlined />,
              label: "控制面板",
            },
          ]}
          className="border-none"
        />
      </div>
    </aside>
  )
}
