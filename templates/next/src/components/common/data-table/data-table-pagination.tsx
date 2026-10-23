"use client"

import type { Table } from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  pageSizeOptions?: number[]
  /** Show "n of total selected" instead of the row count. */
  showSelectedCount?: boolean
  /** Selected rows (default: the keys of the selection state). */
  selectedCount?: number
}

/**
 * DataTable footer: row (or selected) count, rows-per-page select and page
 * buttons. DataTable renders it; use it directly only around your own TanStack table.
 */
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  showSelectedCount = false,
  selectedCount,
}: DataTablePaginationProps<TData>) {
  "use no memo" // reads live TanStack table state

  const { pageIndex, pageSize } = table.getState().pagination
  // rowCount when paginating on the server, otherwise the filtered row count.
  // While grouped, count data rows rather than group rows.
  const total = table.getState().grouping.length && !table.options.manualPagination
    ? table.getFilteredRowModel().rows.length
    : table.getRowCount()
  const selected = selectedCount ?? Object.keys(table.getState().rowSelection).length
  // Keep a custom initial pageSize (e.g. 5) selectable.
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">
        {showSelectedCount
          ? `${selected} of ${total} row${total === 1 ? "" : "s"} selected`
          : `${total} row${total === 1 ? "" : "s"}`}
      </p>
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="font-medium">
          Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
