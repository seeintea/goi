import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, redirect } from "@tanstack/react-router"

import { TanStackDevtools } from "@/components/tanstack-devtools"
import { useHead } from "@/hooks/use-head"
import { Layout } from "@/layout"
import { useUser } from "@/stores"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    const { token, bookId } = useUser.getState()
    const pathname = location.pathname

    if (!token && pathname !== "/login") {
      throw redirect({ to: "/login", replace: true })
    }

    if (token && !bookId && pathname !== "/" && pathname !== "/login") {
      throw redirect({ to: "/", replace: true })
    }
  },
  component: () => {
    // useHead()

    return (
      <>
        <Layout />
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
