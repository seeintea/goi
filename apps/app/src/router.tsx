import { createRouter } from "@tanstack/react-router"
import { getQueryClient } from "@/utils/query-client"
import { buildRouteTree } from "@/utils/route-tree"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = getQueryClient()

  // Build the menu tree once per router creation
  const menuTree = buildRouteTree(routeTree)

  // Create a new router instance
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      menuTree,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
