import { useRouter } from "@tanstack/react-router"
import * as React from "react"

type RouteChildStaticData = {
  name: string
  permission: string
  icon: React.ReactNode
}

export type RouteTreeNode = {
  id: string
  path: string
  staticData: RouteChildStaticData
  children?: RouteTreeNode[]
}

type RouteLike = {
  id?: string
  path?: string
  fullPath?: string
  options?: {
    staticData?: {
      name: string
      permission: string
      icon: React.ReactNode
      groupName?: string
    }
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
    const routes: RouteLike[] = []

    const collect = (route: RouteLike) => {
      for (const child of getRouteChildren(route)) {
        routes.push(child)
        collect(child)
      }
    }

    collect(router.routeTree as unknown as RouteLike)

    const result: RouteTreeNode[] = []
    const groups = new Map<string, RouteTreeNode[]>()

    // First pass: collect all valid nodes and group them
    for (const route of routes) {
      const staticData = route.options?.staticData
      if (!staticData) continue
      if (staticData.permission === "unauthed") continue

      const node: RouteTreeNode = {
        id: getRouteId(route),
        path: getRoutePath(route),
        staticData: {
          name: staticData.name,
          permission: staticData.permission,
          icon: staticData.icon,
        },
      }

      if (staticData.groupName) {
        if (!groups.has(staticData.groupName)) {
          groups.set(staticData.groupName, [])
        }
        groups.get(staticData.groupName)?.push(node)
      } else {
        result.push(node)
      }
    }

    // Second pass: process groups
    for (const [groupName, nodes] of groups) {
      // Find the main node (where name === groupName)
      const mainNodeIndex = nodes.findIndex((n) => n.staticData.name === groupName)

      if (mainNodeIndex !== -1) {
        const mainNode = nodes[mainNodeIndex]
        // Remove main node from children list
        const children = nodes.filter((_, index) => index !== mainNodeIndex)

        if (children.length > 0) {
          mainNode.children = children
        }

        result.push(mainNode)
      } else {
        // Fallback: if no main node found, treat all as top-level items
        // Or create a synthetic group?
        // Based on user request "make groupName === name data be main data",
        // if missing, we probably just add them to result as is to avoid losing them.
        result.push(...nodes)
      }
    }

    return result
  }, [router])
}
