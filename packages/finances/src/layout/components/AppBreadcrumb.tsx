import { useMatches } from "@tanstack/react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AppBreadcrumb() {
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
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.flatMap((crumb, index) => {
          const isLast = index === crumbs.length - 1

          if (isLast) {
            return [
              <BreadcrumbItem key={crumb.to}>
                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
              </BreadcrumbItem>,
            ]
          }

          return [
            <BreadcrumbItem key={crumb.to}>
              <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
            </BreadcrumbItem>,
            <BreadcrumbSeparator key={`${crumb.to}-sep`} />,
          ]
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
