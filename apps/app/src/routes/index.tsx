import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router"
import { logout } from "@/api/service/auth"
import { Button } from "@/components/ui/button"
import { useUser } from "@/stores/useUser"

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: "/login",
        replace: true,
      })
    }
    if (context.user.familyId) {
      throw redirect({
        to: "/dashboard" as any,
        replace: true,
      })
    }
  },
  component: HomeComponent,
  staticData: {
    name: "绑定",
    permission: "unauthed",
    icon: null,
  },
})

function HomeComponent() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const navigate = useNavigate()
  const resetUser = useUser((state) => state.reset)

  const handleLogout = async () => {
    await logout()
    resetUser()
    await router.invalidate()
    navigate({ to: "/login", replace: true })
  }

  return (
    <div className="p-10 flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Hello, {user?.username}!</h1>
      <p>Welcome to the SSR App.</p>
      <Button
        onClick={handleLogout}
        variant="destructive"
      >
        退出登录
      </Button>
    </div>
  )
}
