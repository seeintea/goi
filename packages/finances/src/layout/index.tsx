import { Outlet, useLocation } from "@tanstack/react-router"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Content } from "./content"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function Layout() {
  const { pathname } = useLocation()

  if (pathname === "/login") {
    return <Outlet />
  }

  return <AppLayout />
}

function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <Content />
      </SidebarInset>
    </SidebarProvider>
  )
}
