import type { NavMenuTree } from "@goi/contracts"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"
import { getAuthUser, getNav, getPermissions, type LoginResponse } from "@/api/service/auth"
import { DefaultCatchBoundary } from "@/features/core/pages/default-catch-boundary"
import { NotFound } from "@/features/core/pages/not-found"
import { useUser } from "@/stores/useUser"
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
  component: RootComponent,
})

function RootComponent() {
  const { user } = Route.useRouteContext()
  const setUser = useUser((state) => state.setUser)
  const resetUser = useUser((state) => state.reset)

  useEffect(() => {
    if (user?.userId) {
      setUser({
        userId: user.userId,
        username: user.username,
        token: user.accessToken,
        roleId: user.roleId || "",
        roleName: user.roleName || "",
        familyId: user.familyId || "",
      })
    } else {
      resetUser()
    }
  }, [user, setUser, resetUser])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
