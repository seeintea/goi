import { useState } from "react"

// biome-ignore lint/suspicious/noExplicitAny: <real unknown type>
export function useModal<T = any>() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const show = (record?: T) => {
    setData(record || null)
    setOpen(true)
  }

  const hide = () => {
    setOpen(false)
    setData(null)
  }

  return {
    open,
    data,
    show,
    hide,
    setOpen, // For custom control if needed
  }
}
