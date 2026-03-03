import { Copy, RefreshCw, Send } from "lucide-react"
import { useEffect, useState } from "react"

import { useGenerateInviteCode } from "@/api/queries/family"
import { BaseDialog } from "@/components/base/base-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Route } from "@/routes/__root"

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, data, isPending, error } = useGenerateInviteCode()
  const { user } = Route.useRouteContext()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && user?.familyId) {
      mutate({ familyId: user.familyId })
    }
  }, [open, user?.familyId, mutate])

  const handleCopy = () => {
    if (data?.code) {
      navigator.clipboard.writeText(data.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    if (user?.familyId) {
      mutate({ familyId: user.familyId })
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={setOpen}
      title="邀请加入家庭"
      trigger={
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          邀请加入
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">将此邀请码发送给成员，有效期为7天。</p>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={isPending ? "生成中..." : data?.code || ""}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleRefresh}
                disabled={isPending}
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            onClick={handleCopy}
            disabled={!data?.code || isPending}
          >
            {copied ? <span className="text-xs">已复制</span> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">生成失败: {(error as Error).message}</p>}
      </div>
    </BaseDialog>
  )
}
