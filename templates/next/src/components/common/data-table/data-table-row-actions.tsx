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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { RowAction, RowActionDisplay } from "./types"

type DataTableRowActionsProps<TData> = {
  row: TData
  actions: RowAction<TData>[]
  /** Default placement for actions without their own `display`. */
  display?: RowActionDisplay
}

/** Splits visible actions into inline buttons and "…" menu items. */
export function splitRowActions<TData>(actions: RowAction<TData>[], display: RowActionDisplay) {
  const visible = actions.filter((action) => !action.hidden)
  return {
    inline: visible.filter((action) => (action.display ?? display) === "inline"),
    menu: visible.filter((action) => (action.display ?? display) === "menu"),
  }
}

/** Rough width (px) of the actions cell, used as the column size. */
export function estimateRowActionsWidth<TData>(actions: RowAction<TData>[], display: RowActionDisplay) {
  const { inline, menu } = splitRowActions(actions, display)
  const buttons = [
    ...inline.map((action) => (action.icon ? 28 : action.label.length * 7 + 20)),
    ...(menu.length ? [28] : []),
  ]
  // buttons + 4px gaps + cell padding
  return Math.max(56, buttons.reduce((sum, width) => sum + width, 0) + (buttons.length - 1) * 4 + 16)
}

/** The actions cell: inline buttons and/or a "…" menu for one row. */
export function DataTableRowActions<TData>({
  row,
  actions,
  display = "menu",
}: DataTableRowActionsProps<TData>) {
  const [confirming, setConfirming] = useState<RowAction<TData> | null>(null)
  const { inline, menu } = splitRowActions(actions, display)

  if (!inline.length && !menu.length) return null

  const run = (action: RowAction<TData>) =>
    action.confirm ? setConfirming(action) : action.onClick(row)

  return (
    <div className="flex items-center justify-end gap-1">
      {inline.length > 0 && (
        <TooltipProvider>
          {inline.map((action) => (
            <InlineAction key={action.label} action={action} onSelect={() => run(action)} />
          ))}
        </TooltipProvider>
      )}

      {menu.length > 0 && (
        // Non-modal so a ConfirmDialog can open right after the menu closes.
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <span className="sr-only">Open actions</span>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {menu.map((action, index) => (
              <Fragment key={action.label}>
                {/* Separate the destructive group from the rest. */}
                {action.variant === "destructive" &&
                  index > 0 &&
                  menu[index - 1].variant !== "destructive" && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  variant={action.variant}
                  disabled={action.disabled}
                  onSelect={() => run(action)}
                >
                  {action.icon && <action.icon />}
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
    </div>
  )
}

const destructiveGhost = "text-destructive hover:bg-destructive/10 hover:text-destructive"

/** Icon button with a tooltip, or a small text button when there is no icon. */
function InlineAction<TData>({
  action,
  onSelect,
}: {
  action: RowAction<TData>
  onSelect: () => void
}) {
  const destructive = action.variant === "destructive"

  if (!action.icon) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={action.disabled}
        className={cn(destructive && destructiveGhost)}
        onClick={onSelect}
      >
        {action.label}
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={action.label}
          disabled={action.disabled}
          className={cn(destructive && destructiveGhost)}
          onClick={onSelect}
        >
          <action.icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action.label}</TooltipContent>
    </Tooltip>
  )
}
