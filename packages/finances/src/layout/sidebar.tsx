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
import { useRouteTree } from "@/hooks/use-route-tree"

export function Sidebar() {
  const { pathname } = useLocation()
  const { open } = useSidebar()

  const rootTree = useRouteTree()
  const flatItems = rootTree.filter((n) => !n.isGroup).flatMap((n) => n.children)
  const groupNodes = rootTree.filter((n) => n.isGroup)

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
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.staticData.name}
                      isActive={pathname === item.id}
                      render={<Link to={item.id} />}
                    >
                      {item.staticData.icon}
                      <span>{item.staticData.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupNodes.map((node) => (
          <SidebarGroup key={node.id}>
            <Activity mode={open ? "visible" : "hidden"}>
              <SidebarGroupLabel>{node.groupName}</SidebarGroupLabel>
            </Activity>
            <SidebarGroupContent>
              <SidebarMenu>
                {node.children.map((child) => (
                  <SidebarMenuItem key={child.id}>
                    <SidebarMenuButton
                      tooltip={child.staticData.name}
                      isActive={pathname === child.id}
                      render={<Link to={child.id} />}
                    >
                      {child.staticData.icon}
                      <span>{child.staticData.name}</span>
                    </SidebarMenuButton>
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
