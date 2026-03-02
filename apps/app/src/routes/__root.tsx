import type { LoginResponse, NavMenuTree } from "@goi/contracts"
import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"

import { authUserQueryOptions, navQueryOptions, permissionsQueryOptions } from "@/api/queries/auth"
import appCss from "@/app.css?url"
import { DefaultCatchBoundary, Layout, NotFound } from "@/layout"
import { seo } from "@/utils/seo"

type RouterContext = {
  user?: LoginResponse
  queryClient: QueryClient
  menuTree: NavMenuTree[]
  permissions: string[]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context
    const [user, menuTree, permissions] = await Promise.all([
      queryClient.ensureQueryData(authUserQueryOptions()),
      queryClient.ensureQueryData(navQueryOptions()),
      queryClient.ensureQueryData(permissionsQueryOptions()),
    ])
    return { user, menuTree, permissions }
  },
  head: () => ({
    meta: seo({
      title: "",
      description: "",
    }),
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  component: RootComponent,
})

function RootComponent() {
  const { data: user } = useSuspenseQuery(authUserQueryOptions())
  const { data: menuTree } = useSuspenseQuery(navQueryOptions())

  return (
    <Layout
      user={user}
      menuTree={menuTree}
    />
  )
}
