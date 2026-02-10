import { useLocation, useNavigate } from "@tanstack/react-router"
import type { MenuProps } from "antd"
import { Menu } from "antd"
import { useMemo } from "react"
import { useRouteTree } from "@/hooks/use-route-tree"
import { useSidebar } from "@/stores"
import { cn } from "@/utils/cn"

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isOpen = useSidebar((s) => s.isOpen)
  const routeTree = useRouteTree()

  const items: MenuProps["items"] = useMemo(() => {
    return routeTree.map((node) => {
      // If the node has children, render as SubMenu
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

      // Otherwise render as a regular menu item
      return {
        key: node.id,
        icon: node.staticData.icon,
        label: node.staticData.name,
      }
    })
  }, [routeTree])

  const defaultOpenKeys = useMemo(() => {
    return routeTree.filter((node) => node.children?.some((child) => child.id === pathname)).map((node) => node.id)
  }, [routeTree, pathname])

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col sticky top-0",
        isOpen ? "w-55" : "w-13.75",
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
          defaultOpenKeys={defaultOpenKeys}
          inlineCollapsed={!isOpen}
          inlineIndent={12}
          onClick={({ key }) => navigate({ to: key })}
          items={items}
          className="border-none"
        />
      </div>
    </aside>
  )
}
