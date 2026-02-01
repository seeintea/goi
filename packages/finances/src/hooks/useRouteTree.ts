import { useRouter } from "@tanstack/react-router"
import { nanoid } from "nanoid"
import * as React from "react"

type RouteChildStaticData = {
  name: string
  permission: string
  icon: React.ReactNode
}

export type RouteTreeChild = {
  id: string
  path: string
  staticData: RouteChildStaticData
}

export type RouteTreeNode = {
  id: string
  isGroup: boolean
  groupName: string
  children: RouteTreeChild[]
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
    const groupIndexByName = new Map<string, number>()

    for (const route of routes) {
      const staticData = route.options?.staticData
      if (!staticData) continue
      if (staticData.permission === "unauthed") continue

      const child: RouteTreeChild = {
        id: getRouteId(route),
        path: getRoutePath(route),
        staticData: {
          name: staticData.name,
          permission: staticData.permission,
          icon: staticData.icon,
        },
      }

      if (staticData.groupName) {
        const existingIndex = groupIndexByName.get(staticData.groupName)
        if (existingIndex === undefined) {
          groupIndexByName.set(staticData.groupName, result.length)
          result.push({
            id: nanoid(),
            isGroup: true,
            groupName: staticData.groupName,
            children: [child],
          })
        } else {
          result[existingIndex]?.children.push(child)
        }
      } else {
        result.push({
          id: nanoid(),
          isGroup: false,
          groupName: "",
          children: [child],
        })
      }
    }

    return result
  }, [router])
}
