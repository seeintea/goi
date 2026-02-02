import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"

import { TanStackDevtools } from "@/components/tanstack-devtools"
import { useHead } from "@/hooks/use-head"
import { Layout } from "@/layout"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    useHead()

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
