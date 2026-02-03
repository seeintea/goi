import type { ComponentProps, ReactElement } from "react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  trigger: ReactElement
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: ComponentProps<typeof import("@/components/ui/button").Button>["variant"]
  disabled?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "确定",
  cancelText = "取消",
  confirmVariant = "destructive",
  disabled = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    if (disabled || isPending) return
    setIsPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
    >
      <AlertDialogTrigger
        disabled={disabled}
        render={trigger}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            disabled={isPending}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
