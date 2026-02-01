import { Link, useLocation } from "@tanstack/react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useRouteTree } from "@/hooks/useRouteTree"

export function AppSidebar() {
  const { pathname } = useLocation()

  const rootTree = useRouteTree()
  const flatItems = rootTree.filter((n) => !n.isGroup).flatMap((n) => n.children)
  const groupNodes = rootTree.filter((n) => n.isGroup)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                F
              </div>
              <div className="flex-1 text-left text-sm leading-tight">Finances</div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarSeparator className={"m-0 mt-2"} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="p-2">
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
            <SidebarGroupLabel>{node.groupName}</SidebarGroupLabel>
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
    </Sidebar>
  )
}
