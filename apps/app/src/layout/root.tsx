import type { LoginResponse } from "@goi/contracts"
import { HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"

import { Layout } from "@/layout"
import { useUser } from "@/stores/useUser"

export function RootDocument({ children }: { children: React.ReactNode }) {
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

export function RootLayout({ user }: { user?: LoginResponse }) {
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
      <Layout />
    </RootDocument>
  )
}
