import { Outlet, useLocation } from "@tanstack/react-router"
import { useHead } from "@/hooks/use-head"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function Layout() {
  useHead()
  const { pathname } = useLocation()

  if (pathname === "/login") {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen w-full bg-(--content-bg)">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-(--content-padding) overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
