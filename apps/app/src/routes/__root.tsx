import type { NavMenuTree } from "@goi/contracts"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"

import { getAuthUser, getNav, getPermissions, type LoginResponse } from "@/api/service/auth"
import { DefaultCatchBoundary } from "@/features/core/pages/default-catch-boundary"
import { NotFound } from "@/features/core/pages/not-found"
import { RootDocument, RootLayout } from "@/layout/root"
import appCss from "@/styles/app.css?url"
import { seo } from "@/utils/seo"

type RouterContext = {
  user?: LoginResponse
  queryClient: QueryClient
  menuTree: NavMenuTree[]
  permissions: string[]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const [user, menuTree, permissions] = await Promise.all([getAuthUser(), getNav(), getPermissions()])
    return { user, menuTree, permissions }
  },
  head: () => ({
    meta: seo({
      title: "",
      description: "",
    }),
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => (
    <RootDocument>
      <NotFound />
    </RootDocument>
  ),
  component: () => {
    const { user } = Route.useRouteContext()
    return <RootLayout user={user} />
  },
})
