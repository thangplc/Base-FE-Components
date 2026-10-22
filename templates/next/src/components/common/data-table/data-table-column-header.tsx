"use client"

import type { Column, HeaderContext } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

/** Sortable header: click cycles asc → desc → none. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2.5", className)}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      <Icon data-icon="inline-end" className={cn(!sorted && "text-muted-foreground")} />
    </Button>
  )
}

/** Column `header` renderer with a sort toggle: `header: sortableHeader("Name")`. */
export function sortableHeader<TData, TValue = unknown>(title: string) {
  return function SortableHeader({ column }: HeaderContext<TData, TValue>) {
    return <DataTableColumnHeader column={column} title={title} />
  }
}
