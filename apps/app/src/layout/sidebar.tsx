import { Link, useLocation } from "@tanstack/react-router"
import { BadgeDollarSign } from "lucide-react"
import { Activity } from "react"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Route } from "@/routes/__root"
import { getIcon } from "@/utils/icon-map"

export function Sidebar() {
  const { pathname } = useLocation()
  const { open } = useSidebar()

  const { menuTree } = Route.useRouteContext()

  // Items without children are considered flat/root items
  const flatItems = menuTree.filter((n) => !n.children || n.children.length === 0)
  // Items with children are considered groups
  const groupNodes = menuTree.filter((n) => n.children && n.children.length > 0)

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <BadgeDollarSign size={18} />
              </div>
              <div className="flex-1 text-left text-sm leading-tight">书符</div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {flatItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {flatItems.map((item) => (
                  <SidebarMenuItem key={item.moduleId}>
                    <SidebarMenuButton
                      tooltip={item.name}
                      isActive={pathname === item.routePath}
                      render={
                        <Link to={item.routePath}>
                          {getIcon(item.routePath.split("/").filter(Boolean).pop() || "circle")}
                          <span>{item.name}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupNodes.map((node) => (
          <SidebarGroup key={node.moduleId}>
            <Activity mode={open ? "visible" : "hidden"}>
              <SidebarGroupLabel>{node.name}</SidebarGroupLabel>
            </Activity>
            <SidebarGroupContent>
              <SidebarMenu>
                {node.children?.map((child) => (
                  <SidebarMenuItem key={child.moduleId}>
                    <SidebarMenuButton
                      tooltip={child.name}
                      isActive={pathname === child.routePath}
                      render={
                        <Link to={child.routePath}>
                          {getIcon(child.routePath.split("/").filter(Boolean).pop() || "circle")}
                          <span>{child.name}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </ShadcnSidebar>
  )
}
