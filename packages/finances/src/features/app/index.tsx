import { useNavigate } from "@tanstack/react-router"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BindBookSection } from "@/features/app/components/bind-book"
import { CreateBookDialog } from "@/features/app/components/create-book-dialog"
import { useUser } from "@/stores"

export function App() {
  const navigate = useNavigate()

  const userId = useUser((s) => s.userId)
  const username = useUser((s) => s.username)
  const setBookId = useUser((s) => s.setBookId)

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>书符</CardTitle>
          <CardDescription>{username ? `当前用户：${username}` : "请选择或创建一个书符"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <BindBookSection
            userId={userId}
            onBound={(nextBookId) => {
              setBookId(nextBookId)
              navigate({ to: "/dashboard", replace: true })
            }}
          />

          <div className="relative">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-muted-foreground bg-card">
              或
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">新建书符</div>
            <CreateBookDialog
              ownerUserId={userId}
              onCreated={(createdBookId) => {
                setBookId(createdBookId)
                navigate({ to: "/dashboard", replace: true })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
