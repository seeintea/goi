import type { NavMenuTree, LoginResponse as User } from "@goi/contracts"
import { Outlet, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useUser } from "@/stores"

import { Content } from "./content"
import { Header } from "./header"
import { RootDocument } from "./root-document"
import { Sidebar } from "./sidebar"

export { RootDocument }
export { DefaultCatchBoundary } from "./default-catch-boundary"
export { NotFound } from "./not-found"

interface LayoutProps {
  user?: User
  menuTree?: NavMenuTree[]
}

function LogicLayout({ menuTree }: LayoutProps) {
  const { pathname } = useLocation()

  if (["/login", "/"].includes(pathname)) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <Sidebar menuTree={menuTree} />
      <SidebarInset>
        <Header />
        <Content />
      </SidebarInset>
    </SidebarProvider>
  )
}

export function Layout({ user, menuTree }: LayoutProps) {
  const set = useUser((state) => state.setUser)
  const reset = useUser((state) => state.reset)

  useEffect(() => {
    if (user?.userId) {
      set({
        userId: user.userId,
        username: user.username,
        token: user.accessToken,
        roleId: user.roleId || "",
        roleName: user.roleName || "",
        familyId: user.familyId || "",
      })
    } else {
      reset()
    }
  }, [user, set, reset])

  return (
    <RootDocument>
      <LogicLayout menuTree={menuTree} />
    </RootDocument>
  )
}
