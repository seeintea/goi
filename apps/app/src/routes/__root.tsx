import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackDevtools } from "@/components/tanstack-devtools"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <Outlet />
        <TanStackDevtools />
      </>
    )
  },
  staticData: {
    name: "书符",
    permission: "unauthed",
    icon: null,
  },
})
