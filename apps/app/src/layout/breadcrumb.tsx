import type { NavMenuTree } from "@goi/contracts"
import { useMatches } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from "@/components/ui/breadcrumb"
import { useMenuTree } from "@/hooks/use-route-context"

export function Breadcrumb() {
  const matches = useMatches()
  const menuTree = useMenuTree()

  const pathNameMap = useMemo(() => {
    const map = new Map<string, string>()
    const traverse = (nodes: NavMenuTree[]) => {
      for (const node of nodes) {
        map.set(node.routePath, node.name)
        if (node.children) {
          traverse(node.children)
        }
      }
    }
    if (menuTree) {
      traverse(menuTree)
    }
    return map
  }, [menuTree])

  const crumbs = matches
    .map((match) => {
      const { routeId, loaderData } = match
      // Priority: loaderData.crumb -> menuTree name -> staticData.name
      const loaderCrumb = (loaderData as { crumb?: string } | undefined)?.crumb
      const menuName = pathNameMap.get(routeId)
      const staticName = (match as unknown as { staticData?: { name?: string } })?.staticData?.name

      const name = loaderCrumb ?? menuName ?? staticName

      return {
        to: routeId,
        name,
      }
    })
    .filter((crumb) => crumb.name)

  if (crumbs.length === 0) {
    return null
  }

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        {crumbs.flatMap((crumb, index) => {
          const isLast = index === crumbs.length - 1

          const items = [
            <BreadcrumbItem key={crumb.to}>
              <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
            </BreadcrumbItem>,
          ]

          if (!isLast) {
            items.push(<BreadcrumbSeparator key={`${crumb.to}-sep`} />)
          }

          return items
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  )
}
