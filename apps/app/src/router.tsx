import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { getQueryClient } from "@/utils/query-client"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = getQueryClient()

  // Create a new router instance
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      menuTree: [],
      permissions: [],
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  })

  return router
}
