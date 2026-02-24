import { useNavigate, useRouter } from "@tanstack/react-router"
import { useLogout } from "@/api/queries/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/stores/useUser"
import { BindFamilySection } from "./components/bind-family"
import { CreateFamilyDialog } from "./components/create-family-dialog"

export function Bind() {
  const navigate = useNavigate()
  const router = useRouter()
  const logoutMutation = useLogout()

  const setFamilyId = useUser((s) => s.setFamilyId)

  const handleSuccess = (id: string) => {
    setFamilyId(id)
    navigate({ to: "/dashboard", replace: true })
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    await router.invalidate()
    navigate({ to: "/login", replace: true })
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>请选择或创建一个家庭</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "退出中..." : "退出登录"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <BindFamilySection onBound={handleSuccess} />

          <div className="relative">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-muted-foreground bg-card">
              或
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">新建家庭</div>
            <CreateFamilyDialog onCreated={handleSuccess} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
