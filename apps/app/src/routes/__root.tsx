import type { LoginResponse, NavMenuTree } from "@goi/contracts"
import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createRootRouteWithContext, isRedirect } from "@tanstack/react-router"

import { authUserQueryOptions, navQueryOptions, permissionsQueryOptions } from "@/api/queries/auth"
import { logoutFn } from "@/api/server/auth"
import appCss from "@/app.css?url"
import { DefaultCatchBoundary, Layout, NotFound } from "@/layout"
import { useUser } from "@/stores"
import { seo } from "@/utils/seo"

export type RouterContext = {
  user?: LoginResponse | null
  queryClient: QueryClient
  menuTree: NavMenuTree[]
  permissions: string[]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context
    try {
      const [user, menuTree, permissions] = await Promise.all([
        queryClient.ensureQueryData(authUserQueryOptions()),
        queryClient.ensureQueryData(navQueryOptions()),
        queryClient.ensureQueryData(permissionsQueryOptions()),
      ])
      return { user, menuTree, permissions }
    } catch (e) {
      useUser.getState().reset()
      await logoutFn()
      if (isRedirect(e)) {
        throw e
      }
    }
    return { user: null, menuTree: [], permissions: [] }
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
