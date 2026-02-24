import { useCallback, useState } from "react"
import { useBindFamily } from "@/api/queries/family"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function BindFamilySection({ onBound }: { onBound: (familyId: string) => void }) {
  const [bindFamilyId, setBindFamilyId] = useState("")
  const [bindError, setBindError] = useState("")
  const bindFamilyMutation = useBindFamily()

  const handleBind = useCallback(async () => {
    setBindError("")

    const nextFamilyId = bindFamilyId.trim()
    if (!nextFamilyId) {
      setBindError("请输入 familyId")
      return
    }

    try {
      await bindFamilyMutation.mutateAsync({ familyId: nextFamilyId })
      onBound(nextFamilyId)
    } catch (error) {
      const e = error as Error
      setBindError(e.message || "绑定失败")
    }
  }, [bindFamilyId, onBound, bindFamilyMutation])

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">绑定家庭</div>
      <div className="flex gap-2">
        <Input
          value={bindFamilyId}
          onChange={(e) => setBindFamilyId(e.target.value)}
          placeholder="输入 familyId"
        />
        <Button
          disabled={bindFamilyMutation.isPending}
          onClick={handleBind}
        >
          {bindFamilyMutation.isPending ? "绑定中..." : "绑定"}
        </Button>
      </div>
      <FieldError errors={bindError ? [{ message: bindError }] : undefined} />
    </div>
  )
}
