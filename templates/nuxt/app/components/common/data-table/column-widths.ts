import type { Column } from '@tanstack/vue-table'

/**
 * Column widths for the split header/body tables: each column's `size`,
 * plus — when the container is wider — the spare width shared by the
 * columns that are not `meta.fixedWidth`, in proportion to their size.
 * (A plain `width: 100%` fixed-layout table would stretch every column,
 * actions included.)
 */
export function columnWidths<TData>(columns: Column<TData, unknown>[], available: number) {
  const sizes = columns.map(column => column.getSize())
  const spare = available - sizes.reduce((sum, size) => sum + size, 0)
  const flexible = (column: Column<TData, unknown>) => !column.columnDef.meta?.fixedWidth
  const flexTotal = columns.reduce((sum, column, i) => sum + (flexible(column) ? sizes[i]! : 0), 0)
  if (spare <= 0 || flexTotal === 0)
    return sizes
  const widths = columns.map((column, i) =>
    flexible(column) ? sizes[i]! + Math.floor((spare * sizes[i]!) / flexTotal) : sizes[i]!,
  )
  // Whole pixels only (no stray horizontal scrollbar); the rounding rest
  // goes to the last flexible column.
  const last = columns.findLastIndex(flexible)
  widths[last]! += available - widths.reduce((sum, w) => sum + w, 0)
  return widths
}
