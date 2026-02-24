import type { LoginResponse, NavMenuTree } from "@goi/contracts"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"

import { getAuthUserFn, getNavFn, getPermissionsFn } from "@/api/server/auth"
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
  beforeLoad: async () => {
    const [user, menuTree, permissions] = await Promise.all([getAuthUserFn(), getNavFn(), getPermissionsFn()])
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
  component: () => {
    const { user, menuTree } = Route.useRouteContext()
    return (
      <Layout
        user={user}
        menuTree={menuTree}
      />
    )
  },
})
