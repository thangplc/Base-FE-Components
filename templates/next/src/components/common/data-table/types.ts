import type { RowData } from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Name shown in the "View" (column visibility) menu. Defaults to the column id. */
    label?: string
    /** Extra classes for this column's header and body cells, e.g. "text-right". */
    className?: string
  }
}

export type DataTableFilterOption = {
  label: string
  value: string
  icon?: LucideIcon
}

/** A filter control rendered in the toolbar for one column. */
export type DataTableFilter = {
  columnId: string
  title: string
  /**
   * - select: one value (string)
   * - multi-select: several values (string[])
   * - number-range: [min, max] (either side optional)
   * - date-range: { from, to } as yyyy-mm-dd (either side optional)
   */
  type: "select" | "multi-select" | "number-range" | "date-range"
  /** Required for select / multi-select. */
  options?: DataTableFilterOption[]
}

export type NumberRange = [min: number | undefined, max: number | undefined]
export type DateRange = { from?: string; to?: string }

/** One entry in the row actions menu (the "…" column at the end). */
export type RowAction<TData> = {
  label: string
  icon?: LucideIcon
  /** Awaited when it returns a promise (the confirm dialog shows a spinner meanwhile). */
  onClick: (row: TData) => unknown
  variant?: "default" | "destructive"
  disabled?: boolean
  hidden?: boolean
  /** Ask for confirmation first (rendered with ConfirmDialog). */
  confirm?: { title: string; description?: string; confirmText?: string }
}
