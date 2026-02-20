import { useCallback, useState } from "react"
import { bindFamilyFn } from "@/api/service/family"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function BindFamilySection({ onBound }: { onBound: (familyId: string) => void }) {
  const [bindFamilyId, setBindFamilyId] = useState("")
  const [bindError, setBindError] = useState("")
  const [isBinding, setIsBinding] = useState(false)

  const handleBind = useCallback(async () => {
    setBindError("")

    const nextFamilyId = bindFamilyId.trim()
    if (!nextFamilyId) {
      setBindError("请输入 familyId")
      return
    }

    setIsBinding(true)
    try {
      const result = await bindFamilyFn({
        data: { familyId: nextFamilyId },
      })

      if (result.error) {
        setBindError(result.error)
        return
      }

      if (result.data) {
        onBound(nextFamilyId)
      }
    } catch (error) {
      const e = error as Error
      setBindError(e.message || "绑定失败")
    } finally {
      setIsBinding(false)
    }
  }, [bindFamilyId, onBound])

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
