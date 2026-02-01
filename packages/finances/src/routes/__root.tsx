import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"

import { TanStackDevtools } from "@/components/TanStackDevtools"
import { Layout } from "@/layout"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Layout />
      <TanStackDevtools />
    </>
  ),
  staticData: {
    name: "控制面板",
    permission: "unauthed",
    icon: null,
  },
})
