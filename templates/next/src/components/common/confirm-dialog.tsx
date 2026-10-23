"use client"

import { useState, type ReactElement, type ReactNode } from "react"

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
import { Spinner } from "@/components/ui/spinner"

type ConfirmDialogProps = {
  /** Element that opens the dialog, e.g. a `<Button>`. Omit when controlling `open`. */
  trigger?: ReactElement
  /** Controlled open state (e.g. opened from a menu item). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  /**
   * May return a promise: the dialog stays open with a spinner until it
   * settles, and stays open (for a retry) if it rejects.
   */
  onConfirm: () => void | Promise<void>
}

/**
 * Asks before a destructive or important action (on the shadcn AlertDialog).
 * Open it from `trigger`, or control it with `open` / `onOpenChange`.
 * `onConfirm` may be async: a spinner shows until it settles.
 */
export function ConfirmDialog({
  trigger,
  open: openProp,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const [innerOpen, setInnerOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const open = openProp ?? innerOpen

  function setOpen(next: boolean) {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  async function handleConfirm(event: React.MouseEvent) {
    event.preventDefault()
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // Keep the dialog open so the user can retry; onConfirm reports the error.
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending && <Spinner data-icon="inline-start" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
