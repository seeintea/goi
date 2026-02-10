import { message, Tooltip } from "antd"
import { Copy } from "lucide-react"

interface ShortIdProps {
  id: string
  length?: number
}

export function ShortId({ id, length = 6 }: ShortIdProps) {
  if (!id) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id)
      message.success("复制成功")
    } catch {
      message.error("复制失败")
    }
  }

  const shortId = id.length > length * 2 ? `${id.slice(0, length)}...${id.slice(-length)}` : id

  return (
    <Tooltip title={id}>
      <button
        type="button"
        className="cursor-pointer font-mono text-xs text-gray-500 hover:text-primary flex items-center gap-1 border-none bg-transparent p-0"
        onClick={handleCopy}
      >
        {shortId}
        <Copy
          size={12}
          className="opacity-50"
        />
      </button>
    </Tooltip>
  )
}
