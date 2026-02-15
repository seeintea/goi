import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"
import { getAuthUser, type LoginResponse } from "@/api/service/auth"
import { DefaultCatchBoundary } from "@/features/core/pages/default-catch-boundary"
import { NotFound } from "@/features/core/pages/not-found"
import { seo } from "@/lib/seo"
import { useUser } from "@/stores/useUser"
import appCss from "@/styles/app.css?url"

type RouterContext = {
  user?: LoginResponse
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const user = await getAuthUser()
    return { user }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: "TanStack Start is a type-safe, client-first, full-stack React framework. ",
      }),
    ],
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
