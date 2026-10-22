"use client"

import { Suspense, useMemo, useRef, useState, type ReactNode } from "react"
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableRowActions } from "./data-table-row-actions"
import { DataTableToolbar } from "./data-table-toolbar"
import { filterFnByType } from "./filter-fns"
import type { DataTableFilter, RowAction } from "./types"
import { useControllableState } from "./use-controllable-state"

export type DataTableProps<TData, TValue = unknown> = {
  // Data
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable row id (e.g. `(row) => row.id`); needed for row selection across pages. */
  getRowId?: (row: TData, index: number) => string
  /** Shows skeleton rows in the body while keeping the header. */
  isLoading?: boolean
  /** Shown when there are no rows, e.g. an `<EmptyState />`. */
  emptyState?: ReactNode
  /** Click anywhere on a row (clicks on buttons, links and checkboxes are ignored). */
  onRowClick?: (row: TData) => void
  className?: string

  // Search
  /** Shows the search box. */
  searchPlaceholder?: string
  /** Only search these column ids (default: every text/number column). */
  searchColumns?: string[]
  /** Controlled search text, e.g. to query an API. */
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchDebounceMs?: number

  // Sorting
  defaultSorting?: SortingState
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** Rows arrive already sorted (server-side). */
  manualSorting?: boolean
  /** Shift + click to sort by several columns. */
  enableMultiSort?: boolean

  // Filters
  filters?: DataTableFilter[]
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  /** Rows arrive already filtered / searched (server-side). */
  manualFiltering?: boolean

  // Row actions
  /** Adds a "…" menu column at the end. */
  rowActions?: (row: TData) => RowAction<TData>[]
  /** Keep the actions column visible on the right while scrolling horizontally. */
  actionsColumnPinned?: boolean

  // Layout
  /** Body scrolls inside this height (number = px). The scrollbar stays inside the body. */
  maxBodyHeight?: number | string
  /** With `maxBodyHeight`: keep the header fixed above the scrolling body. */
  stickyHeader?: boolean

  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  /** Rows arrive already paginated (server-side); pass `rowCount` too. */
  manualPagination?: boolean
  /** Total rows on the server when `manualPagination`. */
  rowCount?: number
  showPagination?: boolean

  // Toolbar & selection
  /** Controls on the right of the toolbar, e.g. an "Add" button. */
  toolbarActions?: ReactNode
  enableColumnVisibility?: boolean
  defaultColumnVisibility?: VisibilityState
  /** Adds a checkbox column. Pass a function to decide per row. */
  enableRowSelection?: boolean | ((row: TData) => boolean)
  onRowSelectionChange?: (rows: TData[]) => void
  /** Toolbar content while rows are selected (delete, export...). */
  bulkActions?: (rows: TData[], helpers: { clear: () => void }) => ReactNode
}

/**
 * Data table on top of TanStack Table: search, sort, filters, row actions,
 * selection, sticky header with a body-only scrollbar, and pagination.
 *
 * Every piece of state (search, sorting, filters, pagination) works out of
 * the box, or can be controlled from outside and combined with the
 * `manual*` flags to let a server do the work.
 */
export function DataTable<TData, TValue = unknown>(props: DataTableProps<TData, TValue>) {
  // TanStack Table reads the clock while rendering, which Cache Components
  // refuses to prerender, so the table streams in behind a skeleton.
  return (
    <Suspense fallback={<DataTableSkeleton rows={Math.min(props.pageSize ?? 10, 10)} />}>
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
  getRowId,
  isLoading = false,
  emptyState = "No results.",
  onRowClick,
  className,
  searchPlaceholder,
  searchColumns,
  searchValue,
  onSearchChange,
  searchDebounceMs,
  defaultSorting,
  sorting: sortingProp,
  onSortingChange,
  manualSorting = false,
  enableMultiSort = false,
  filters,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  manualFiltering = false,
  rowActions,
  actionsColumnPinned = true,
  maxBodyHeight,
  stickyHeader = true,
  pageSize = 10,
  pageSizeOptions,
  pagination: paginationProp,
  onPaginationChange,
  manualPagination = false,
  rowCount,
  showPagination = true,
  toolbarActions,
  enableColumnVisibility = true,
  defaultColumnVisibility,
  enableRowSelection,
  onRowSelectionChange,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  "use no memo" // TanStack Table is not compatible with React Compiler memoization

  const [sorting, setSorting] = useControllableState(sortingProp, onSortingChange, defaultSorting ?? [])
  const [columnFilters, setColumnFiltersState] = useControllableState(
    columnFiltersProp,
    onColumnFiltersChange,
    []
  )
  const [globalFilter, setGlobalFilterState] = useControllableState(searchValue, onSearchChange, "")
  const [pagination, setPagination] = useControllableState(paginationProp, onPaginationChange, {
    pageIndex: 0,
    pageSize,
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility ?? {})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // A new search or filter always starts again from the first page.
  const firstPage = () => setPagination((old) => (old.pageIndex === 0 ? old : { ...old, pageIndex: 0 }))
  const setColumnFilters = (updater: Updater<ColumnFiltersState>) => {
    setColumnFiltersState(updater)
    firstPage()
  }
  const setGlobalFilter = (updater: Updater<string>) => {
    setGlobalFilterState(updater)
    firstPage()
  }

  const allColumns = useMemo(() => {
    const withFilterFns = columns.map((column) => {
      const id = column.id ?? ("accessorKey" in column ? String(column.accessorKey) : undefined)
      const filter = filters?.find((f) => f.columnId === id)
      return filter && !column.filterFn
        ? { ...column, filterFn: filterFnByType[filter.type] as FilterFn<TData> }
        : column
    })
    return [
      ...(enableRowSelection ? [selectionColumn<TData, TValue>()] : []),
      ...withFilterFns,
      ...(rowActions ? [actionsColumn<TData, TValue>(rowActions, actionsColumnPinned)] : []),
    ]
  }, [columns, filters, enableRowSelection, rowActions, actionsColumnPinned])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, columnFilters, globalFilter, pagination, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next = functionalUpdate(updater, rowSelection)
      setRowSelection(next)
      onRowSelectionChange?.(selectedOriginals(table, next))
    },
    enableRowSelection:
      typeof enableRowSelection === "function"
        ? (row) => enableRowSelection(row.original)
        : Boolean(enableRowSelection),
    enableMultiSort,
    isMultiSortEvent: (event) => (event as MouseEvent).shiftKey,
    manualSorting,
    manualFiltering,
    manualPagination,
    rowCount: manualPagination ? rowCount : undefined,
    autoResetPageIndex: false,
    ...(searchColumns && { getColumnCanGlobalFilter: (column) => searchColumns.includes(column.id) }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const rows = table.getRowModel().rows

  function handleRowClick(event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) {
    if (!onRowClick) return
    // Ignore clicks from portals (menus, dialogs) and from interactive cells.
    if (!event.currentTarget.contains(event.target as Node)) return
    if ((event.target as HTMLElement).closest("button, a, input, label, [role=checkbox]")) return
    onRowClick(row.original)
  }

  const headerRows = table.getHeaderGroups().map((headerGroup) => (
    <TableRow key={headerGroup.id} className="hover:bg-transparent">
      {headerGroup.headers.map((header) => (
        <TableHead
          key={header.id}
          colSpan={header.colSpan}
          className={header.column.columnDef.meta?.className}
        >
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
        </TableHead>
      ))}
    </TableRow>
  ))

  const bodyRows = isLoading ? (
    Array.from({ length: Math.min(pagination.pageSize, 10) }, (_, i) => (
      <TableRow key={i} className="hover:bg-transparent">
        {visibleColumns.map((column) => (
          <TableCell key={column.id}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : rows.length ? (
    rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() ? "selected" : undefined}
        className={cn("group/row", onRowClick && "cursor-pointer")}
        onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={visibleColumns.length} className="h-24 text-center text-muted-foreground">
        {emptyState}
      </TableCell>
    </TableRow>
  )

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchDebounceMs={searchDebounceMs}
        filters={filters}
        enableColumnVisibility={enableColumnVisibility}
        actions={toolbarActions}
        bulkActions={bulkActions}
      />
      {maxBodyHeight === undefined ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>{headerRows}</TableHeader>
            <TableBody>{bodyRows}</TableBody>
          </Table>
        </div>
      ) : stickyHeader ? (
        <ScrollBodyTable table={table} maxBodyHeight={maxBodyHeight} header={headerRows} body={bodyRows} />
      ) : (
        <div className="overflow-auto rounded-lg border" style={{ maxHeight: maxBodyHeight }}>
          <table className="w-full caption-bottom text-sm">
            <TableHeader>{headerRows}</TableHeader>
            <TableBody>{bodyRows}</TableBody>
          </table>
        </div>
      )}
      {showPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showSelectedCount={Boolean(enableRowSelection)}
        />
      )}
    </div>
  )
}

/**
 * Header and body are two tables sharing the same column widths, so the
 * vertical scrollbar only spans the body. `scrollbar-gutter: stable` keeps
 * both the same width; horizontal scrolling of the body drives the header.
 * Column widths come from `size` in the column defs (TanStack default 150).
 */
function ScrollBodyTable<TData>({
  table,
  maxBodyHeight,
  header,
  body,
}: {
  table: TanstackTable<TData>
  maxBodyHeight: number | string
  header: ReactNode
  body: ReactNode
}) {
  "use no memo"

  const headerRef = useRef<HTMLDivElement>(null)
  const columns = table.getVisibleLeafColumns()
  const colgroup = (
    <colgroup>
      {columns.map((column) => (
        <col key={column.id} style={{ width: column.getSize() }} />
      ))}
    </colgroup>
  )
  const tableClass = "w-full table-fixed caption-bottom text-sm"
  const minWidth = table.getVisibleLeafColumns().reduce((sum, column) => sum + column.getSize(), 0)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div ref={headerRef} className="overflow-hidden [scrollbar-gutter:stable]">
        <table className={tableClass} style={{ minWidth }}>
          {colgroup}
          <TableHeader>{header}</TableHeader>
        </table>
      </div>
      <div
        className="overflow-auto [scrollbar-gutter:stable]"
        style={{ maxHeight: maxBodyHeight }}
        onScroll={(event) => {
          if (headerRef.current) headerRef.current.scrollLeft = event.currentTarget.scrollLeft
        }}
      >
        <table className={tableClass} style={{ minWidth }}>
          {colgroup}
          <TableBody>{body}</TableBody>
        </table>
      </div>
    </div>
  )
}

function selectedOriginals<TData>(table: TanstackTable<TData>, selection: RowSelectionState) {
  const rowsById = table.getCoreRowModel().rowsById
  return Object.keys(selection)
    .filter((id) => selection[id])
    .map((id) => rowsById[id]?.original)
    .filter((row): row is TData => row !== undefined)
}

function selectionColumn<TData, TValue>(): ColumnDef<TData, TValue> {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    meta: { className: "w-10" },
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  }
}

// Matches TableRow's hover / selected colors, but opaque so content
// scrolling underneath the pinned column stays hidden.
const pinnedRightClass =
  "sticky right-0 z-[1] bg-background shadow-[inset_1px_0_0_var(--border)] group-hover/row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))] group-data-[state=selected]/row:bg-muted"

function actionsColumn<TData, TValue>(
  rowActions: (row: TData) => RowAction<TData>[],
  pinned: boolean
): ColumnDef<TData, TValue> {
  return {
    id: "actions",
    size: 56,
    enableSorting: false,
    enableHiding: false,
    meta: { className: cn("w-14 text-right", pinned && pinnedRightClass) },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DataTableRowActions row={row.original} actions={rowActions(row.original)} />,
  }
}
