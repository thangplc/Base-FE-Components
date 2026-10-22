"use client"

import { Fragment, useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RowAction } from "./types"

type DataTableRowActionsProps<TData> = {
  row: TData
  actions: RowAction<TData>[]
}

/** The "…" menu rendered in the actions column for one row. */
export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
  const [confirming, setConfirming] = useState<RowAction<TData> | null>(null)
  const visible = actions.filter((action) => !action.hidden)

  if (!visible.length) return null

  return (
    <>
      {/* Non-modal so a ConfirmDialog can open right after the menu closes. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Open actions</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {visible.map((action, index) => (
            <Fragment key={action.label}>
              {/* Separate the destructive group from the rest. */}
              {action.variant === "destructive" &&
                index > 0 &&
                visible[index - 1].variant !== "destructive" && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.variant}
                disabled={action.disabled}
                onSelect={() => (action.confirm ? setConfirming(action) : action.onClick(row))}
              >
                {action.icon && <action.icon />}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {confirming?.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirming(null)}
          title={confirming.confirm.title}
          description={confirming.confirm.description}
          confirmText={confirming.confirm.confirmText ?? confirming.label}
          variant={confirming.variant}
          onConfirm={async () => {
            await confirming.onClick(row)
          }}
        />
      )}
    </>
  )
}
