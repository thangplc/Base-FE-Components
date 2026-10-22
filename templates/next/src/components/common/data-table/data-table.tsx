"use client"

import { Suspense, useState, type ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows a search box that filters across all columns. */
  searchPlaceholder?: string
  /** Extra controls rendered on the right of the toolbar (e.g. "Add" button). */
  toolbarActions?: ReactNode
  pageSize?: number
  emptyMessage?: ReactNode
}

/**
 * Client-side table with global search, sorting, column visibility and
 * pagination. For server-side data, lift `sorting` / `pagination` state up
 * and pass `manualSorting` / `manualPagination` to `useReactTable`.
 */
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  // TanStack Table reads the clock while rendering, which Cache Components
  // refuses to prerender, so the table streams in behind a skeleton.
  return (
    <Suspense fallback={<DataTableSkeleton rows={props.pageSize ?? 10} />}>
      <DataTableContent {...props} />
    </Suspense>
  )
}

function DataTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-full sm:max-w-xs" />
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}

function DataTableContent<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  toolbarActions,
  pageSize = 10,
  emptyMessage = "No results.",
}: DataTableProps<TData, TValue>) {
  "use no memo" // TanStack Table is not compatible with React Compiler memoization

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, globalFilter },
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        actions={toolbarActions}
      />
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
