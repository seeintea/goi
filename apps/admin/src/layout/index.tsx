import { Outlet, useLocation } from "@tanstack/react-router"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function Layout() {
  const { pathname } = useLocation()

  if (pathname === "/login") {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
           <Outlet />
        </main>
      </div>
    </div>
  )
}
