import { useLocation, useNavigate } from "@tanstack/react-router"
import type { MenuProps } from "antd"
import { Menu, Segmented } from "antd"
import { BadgeDollarSign, LayoutGrid, MonitorCog } from "lucide-react"
import { Activity, useEffect, useMemo, useState } from "react"
import { useRouteTree } from "@/hooks/use-route-tree"
import { useSetting } from "@/stores"
import { cn } from "@/utils/cn"

type ModuleType = "admin" | "app"

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isOpen = useSetting((s) => s.sidebarOpen)
  const routeTree = useRouteTree()
  const [activeModule, setActiveModule] = useState<ModuleType>("admin")

  // Sync active module with pathname
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setActiveModule("admin")
    } else if (pathname.startsWith("/app")) {
      setActiveModule("app")
    }
  }, [pathname])

  const filteredRouteTree = useMemo(() => {
    return routeTree.filter((node) => node.id.startsWith(`/${activeModule}`))
  }, [routeTree, activeModule])

  const items: MenuProps["items"] = useMemo(() => {
    return filteredRouteTree.map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          key: node.id,
          label: node.staticData.name,
          icon: node.staticData.icon,
          children: node.children.map((child) => ({
            key: child.id,
            icon: child.staticData.icon,
            label: child.staticData.name,
          })),
        }
      }
      return {
        key: node.id,
        icon: node.staticData.icon,
        label: node.staticData.name,
      }
    })
  }, [filteredRouteTree])

  const defaultOpenKeys = useMemo(() => {
    return filteredRouteTree
      .filter((node) => node.children?.some((child) => child.id === pathname))
      .map((node) => node.id)
  }, [filteredRouteTree, pathname])

  const handleModuleChange = (value: ModuleType) => {
    setActiveModule(value)

    // Find the first route of the selected module to navigate to
    const targetRoutes = routeTree.filter((node) => node.id.startsWith(`/${value}`))
    if (targetRoutes.length > 0) {
      const firstRoute = targetRoutes[0]
      // If it has children, go to the first child
      if (firstRoute.children && firstRoute.children.length > 0) {
        navigate({ to: firstRoute.children[0].id })
      } else {
        navigate({ to: firstRoute.id })
      }
    }
  }

  return (
    <aside
      className={cn(
        "h-screen bg-(--color-bg-container) border-r border-(--color-border-secondary) transition-all duration-300 ease-in-out flex flex-col sticky top-0",
        isOpen ? "w-(--sidebar-width)" : "w-(--sidebar-collapsed-width)",
      )}
    >
      <div
        className={cn(
          "h-(--header-height) flex justify-center border-b border-(--color-border-secondary) shrink-0 overflow-hidden whitespace-nowrap",
          isOpen ? "justify-start" : "justify-center",
        )}
      >
        <div className="flex items-center gap-2 text-primary font-bold text-lg px-4">
          <BadgeDollarSign className="w-6 h-6 shrink-0" />
          <span className={cn("transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 hidden")}>
            运营后台
          </span>
        </div>
      </div>

      <Activity mode={isOpen ? "visible" : "hidden"}>
        <div className="px-2 py-4">
          <Segmented
            block
            value={activeModule}
            onChange={(value) => handleModuleChange(value as ModuleType)}
            options={[
              {
                label: (
                  <div className={"flex items-center gap-2 py-1"}>
                    <LayoutGrid size={16} />
                    应用管理
                  </div>
                ),
                value: "app",
              },
              {
                label: (
                  <div className={"flex items-center gap-2 py-1"}>
                    <MonitorCog size={16} />
                    平台管理
                  </div>
                ),
                value: "admin",
              },
            ]}
          />
        </div>
      </Activity>

      <div className="flex-1 overflow-y-auto py-2">
        <Menu
          key={activeModule}
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={defaultOpenKeys}
          inlineCollapsed={!isOpen}
          onClick={({ key }) => navigate({ to: key })}
          items={items}
          className="border-none"
        />
      </div>
    </aside>
  )
}
