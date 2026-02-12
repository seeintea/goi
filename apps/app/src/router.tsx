import { createRouter } from "@tanstack/react-router"
// import type { ReactNode } from "react"
import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"
import "./styles.css"

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

export function getRouter() {
  // Create a new router instance
  const router = createRouter({
    routeTree,
    context: {
      ...TanStackQueryProviderContext,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })
  return router
}

// Register the router instance for type safety
// declare module "@tanstack/react-router" {
//   interface Register {
//     router: typeof router
//   }

//   interface StaticDataRouteOption {
//     name: string
//     permission: string
//     icon: ReactNode
//     groupName?: string
//   }
// }
