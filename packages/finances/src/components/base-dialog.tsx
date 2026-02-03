import type { ReactElement, ReactNode } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export { DialogFooter } from "@/components/ui/dialog"

type BaseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  trigger?: ReactElement
  children: ReactNode
}

export function BaseDialog({ open, onOpenChange, title, trigger, children }: BaseDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
