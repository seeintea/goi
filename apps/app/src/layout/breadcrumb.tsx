import { useMatches } from "@tanstack/react-router"

import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from "@/components/ui/breadcrumb"

export function Breadcrumb() {
  const matches = useMatches()

  const crumbs = matches.map((match) => {
    const staticData = (match as unknown as { staticData?: { name?: string } })?.staticData ?? null
    const name = staticData?.name ?? ""
    return { to: match.routeId, name }
  })

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
