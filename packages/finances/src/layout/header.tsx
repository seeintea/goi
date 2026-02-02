import { useNavigate } from "@tanstack/react-router"

import { useLogout } from "@/api"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/stores"
import { Breadcrumb } from "./breadcrumb"

export function Header() {
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const username = useUser((s) => s.username)

  return (
    <header className="h-14 shrink-0 border-b bg-background flex items-center justify-between gap-3 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <div className="min-w-0">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground truncate max-w-40">{username || "-"}</div>
        <Button
          variant="outline"
          size="sm"
          disabled={logoutMutation.isPending}
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSettled: () => {
                navigate({ to: "/login" })
              },
            })
          }}
        >
          退出登录
        </Button>
      </div>
    </header>
  )
}
