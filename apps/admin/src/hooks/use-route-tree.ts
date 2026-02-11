import { useRouter } from "@tanstack/react-router"
import * as React from "react"

export type RouteTreeNode = {
  id: string
  path: string
  staticData: {
    name: string
    permission: string
    icon?: React.ReactNode
    order?: number
    menuType?: "group" | "item" | "hidden" | "flatten"
  }
  children?: RouteTreeNode[]
}

type RouteLike = {
  id?: string
  path?: string
  fullPath?: string
  options?: {
    staticData?: RouteTreeNode["staticData"]
  }
  children?: unknown
}

function getRouteChildren(route: RouteLike): RouteLike[] {
  const children = route.children
  if (!children) return []
  if (Array.isArray(children)) return children as RouteLike[]
  if (typeof children === "object") return Object.values(children as Record<string, RouteLike>)
  return []
}

function getRouteId(route: RouteLike): string {
  return route.fullPath ?? route.id ?? ""
}

function getRoutePath(route: RouteLike): string {
  return route.path ?? route.fullPath ?? route.id ?? ""
}

export function useRouteTree(): RouteTreeNode[] {
  const router = useRouter()

  return React.useMemo(() => {
    // Recursive function to build the tree
    const buildTree = (route: RouteLike): RouteTreeNode[] => {
      const staticData = route.options?.staticData

      // 1. Skip if no staticData (assuming strict mode)
      if (!staticData) return []

      // 2. Skip if unauthed
      if (staticData.permission === "unauthed" && staticData.menuType !== "flatten") return []

      // 3. Skip if hidden
      if (staticData.menuType === "hidden") return []

      // Process children first
      const children = getRouteChildren(route)
        .flatMap(buildTree)
        .sort((a, b) => (a.staticData.order ?? 99) - (b.staticData.order ?? 99))

      // 4. Handle "flatten": return children directly, skipping current node
      if (staticData.menuType === "flatten") {
        return children
      }

      // 5. Normal/Group: Create node and attach children
      const node: RouteTreeNode = {
        id: getRouteId(route),
        path: getRoutePath(route),
        staticData,
      }

      if (children.length > 0) {
        node.children = children
      }

      return [node]
    }

    // Root level handling
    const rootRoute = router.routeTree as unknown as RouteLike
    const topLevelRoutes = getRouteChildren(rootRoute)

    const tree = topLevelRoutes
      .flatMap(buildTree)
      .sort((a, b) => (a.staticData.order ?? 99) - (b.staticData.order ?? 99))

    return tree
  }, [router])
}
