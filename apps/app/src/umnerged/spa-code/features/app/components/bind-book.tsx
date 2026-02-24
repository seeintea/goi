import { useCallback, useState } from "react"
import { useCreateBookMember } from "@/api"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function BindBookSection({ userId, onBound }: { userId: string; onBound: (bookId: string) => void }) {
  const [bindBookId, setBindBookId] = useState("")
  const [bindError, setBindError] = useState("")

  const createBookMemberMutation = useCreateBookMember()
  const isBinding = createBookMemberMutation.isPending

  const handleBind = useCallback(async () => {
    setBindError("")

    const nextBookId = bindBookId.trim()
    if (!nextBookId) {
      setBindError("请输入 bookId")
      return
    }
    if (!userId) {
      setBindError("用户信息缺失，请重新登录")
      return
    }

    try {
      await createBookMemberMutation.mutateAsync({
        bookId: nextBookId,
        userId,
        roleCode: "Member",
      })
      onBound(nextBookId)
    } catch (error) {
      const e = error as Error
      setBindError(e.message || "绑定失败")
    }
  }, [bindBookId, createBookMemberMutation, onBound, userId])

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">绑定书符</div>
      <div className="flex gap-2">
        <Input
          value={bindBookId}
          onChange={(e) => setBindBookId(e.target.value)}
          placeholder="输入 bookId"
        />
        <Button
          disabled={isBinding}
          onClick={handleBind}
        >
          {isBinding ? "绑定中..." : "绑定"}
        </Button>
      </div>
      <FieldError errors={bindError ? [{ message: bindError }] : undefined} />
    </div>
  )
}
