"use client"

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type Header,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Column,
  type Table as TanstackTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"

import { MinusIcon, PlusIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TruncatedText } from "@/components/common/truncated-text"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableRowActions, estimateRowActionsWidth } from "./data-table-row-actions"
import { DataTableToolbar } from "./data-table-toolbar"
import { filterFnByType } from "./filter-fns"
import type { DataTableFilter, RowAction, RowActionDisplay } from "./types"
import { useControllableState } from "./use-controllable-state"

export type DataTableProps<TData, TValue = unknown> = {
  // Data
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable row id (e.g. `(row) => row.id`); needed for row selection across pages and `rowSelection`. */
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
  /** Adds an actions column at the end. */
  rowActions?: (row: TData) => RowAction<TData>[]
  /**
   * Default placement of the actions: all inside a "…" menu, or each as its
   * own button. A single action can override it with `display`.
   */
  rowActionsDisplay?: RowActionDisplay
  /** Width of the actions column in px (default: estimated from the actions). */
  actionsColumnSize?: number
  /**
   * When the columns don't fit and the table scrolls horizontally, keep the
   * actions column fixed on the right. When everything fits it is a normal column.
   */
  actionsColumnPinned?: boolean

  // Layout
  /** Vertical borders between cells (reads better with grouped headers and merged rows). */
  bordered?: boolean
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
  /** "checkbox" (default) or "radio" (one row at a time). */
  selectionType?: "checkbox" | "radio"
  /** Header checkbox: the current page ("page", default) or every filtered row ("all"). */
  selectAllMode?: "page" | "all"
  /** When the table scrolls horizontally, keep the checkbox column fixed on the left. */
  selectionColumnPinned?: boolean
  /** Controlled selection: row ids from `getRowId` (kept across pages, also server-side). */
  rowSelection?: string[]
  /** Selected rows (those loaded) and the ids of every selected row. */
  onRowSelectionChange?: (rows: TData[], ids: string[]) => void
  /** Toolbar content while rows are selected (delete, export...). */
  bulkActions?: (rows: TData[], helpers: { clear: () => void }) => ReactNode

  // Grouping
  /** Group rows by these column ids, nested in this order. */
  grouping?: string[]
  defaultGrouping?: string[]
  onGroupingChange?: (grouping: string[]) => void
  /** "Group by" menu in the toolbar (columns with an accessor and `enableGrouping !== false`). */
  enableGrouping?: boolean
  /** Groups start expanded (default true). */
  defaultExpanded?: boolean
  /** Paginate over top-level groups instead of every visible row. */
  paginateGroups?: boolean
  /** Label of a group row (default "Column: value"); the count is added after it. */
  renderGroupRow?: (row: Row<TData>) => ReactNode
  /** Keep grouped columns as normal columns (default: hidden, their value is in the group row). */
  keepGroupedColumns?: boolean
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
  rowActionsDisplay = "menu",
  actionsColumnSize,
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
  selectionType = "checkbox",
  selectAllMode = "page",
  selectionColumnPinned = true,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  bulkActions,
  bordered = false,
  grouping: groupingProp,
  defaultGrouping,
  onGroupingChange,
  enableGrouping = false,
  defaultExpanded = true,
  paginateGroups = false,
  renderGroupRow,
  keepGroupedColumns = false,
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
  const [innerSelection, setInnerSelection] = useState<RowSelectionState>({})
  // Controlled selection comes in as ids; TanStack wants { [id]: true }.
  const rowSelection = useMemo(
    () => (rowSelectionProp ? Object.fromEntries(rowSelectionProp.map((id) => [id, true])) : innerSelection),
    [rowSelectionProp, innerSelection]
  )
  const [groupingState, setGroupingState] = useControllableState<GroupingState>(
    groupingProp,
    onGroupingChange,
    defaultGrouping ?? []
  )
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpanded ? true : {})
  const grouped = groupingState.length > 0

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
  const setGrouping = (updater: Updater<GroupingState>) => {
    setGroupingState(updater)
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
    // Size the actions column for the widest set of actions on the first rows.
    const actionsSize =
      actionsColumnSize ??
      Math.max(
        56,
        ...data.slice(0, 50).map((row) => estimateRowActionsWidth(rowActions?.(row) ?? [], rowActionsDisplay))
      )
    return [
      ...(enableRowSelection
        ? [selectionColumn<TData, TValue>(selectionType, selectAllMode, selectionColumnPinned)]
        : []),
      ...withFilterFns,
      ...(rowActions
        ? [actionsColumn<TData, TValue>(rowActions, rowActionsDisplay, actionsSize, actionsColumnPinned)]
        : []),
    ]
  }, [
    columns,
    data,
    filters,
    enableRowSelection,
    selectionType,
    selectAllMode,
    selectionColumnPinned,
    rowActions,
    rowActionsDisplay,
    actionsColumnSize,
    actionsColumnPinned,
  ])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      rowSelection,
      grouping: groupingState,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next = functionalUpdate(updater, rowSelection)
      // Group rows get selected along with their children; keep row ids only.
      const groupIds = new Set(table.getGroupedRowModel().flatRows.filter((r) => r.getIsGrouped()).map((r) => r.id))
      const ids = Object.keys(next).filter((id) => next[id] && !groupIds.has(id))
      if (!rowSelectionProp) setInnerSelection(next)
      onRowSelectionChange?.(selectedOriginals(table, ids), ids)
    },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    enableRowSelection:
      typeof enableRowSelection === "function"
        ? (row) => row.getIsGrouped() || enableRowSelection(row.original)
        : Boolean(enableRowSelection),
    enableMultiRowSelection: selectionType !== "radio",
    groupedColumnMode: keepGroupedColumns ? false : "remove",
    paginateExpandedRows: !paginateGroups,
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
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const rows = table.getRowModel().rows

  // Whether the columns overflow horizontally; drives the pinned actions
  // column through `data-overflow-x` (see pinnedRightClass).
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [overflowX, setOverflowX] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const update = () => setOverflowX(scroller.scrollWidth > scroller.clientWidth + 1)
    // The scroller resizes with the window; the table with its columns.
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild)
    return () => observer.disconnect()
  }, [maxBodyHeight, stickyHeader])

  function handleRowClick(event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) {
    if (!onRowClick) return
    // Ignore clicks from portals (menus, dialogs) and from interactive cells.
    if (!event.currentTarget.contains(event.target as Node)) return
    if ((event.target as HTMLElement).closest("button, a, input, label, [role=checkbox]")) return
    onRowClick(row.original)
  }

  const headerRows = renderHeaderRows(table, bordered)
  const spans = grouped ? undefined : mergedRowSpans(rows, visibleColumns)
  // The first data column carries the group label / indent while grouping.
  const labelColumnId = visibleColumns.find((column) => column.id !== "select")?.id

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
        data-group={row.getIsGrouped() || undefined}
        className={cn("group/row", row.getIsGrouped() && "bg-muted/40 font-medium", onRowClick && !row.getIsGrouped() && "cursor-pointer")}
        onClick={onRowClick && !row.getIsGrouped() ? (event) => handleRowClick(event, row) : undefined}
      >
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta
          const span = spans?.get(`${row.id}:${cell.column.id}`)
          if (span === 0) return null
          const isLabel = grouped && cell.column.id === labelColumnId
          let content: ReactNode
          if (row.getIsGrouped() && cell.column.id !== "select") {
            content = isLabel ? (
              <GroupLabel row={row} table={table} renderGroupRow={renderGroupRow} />
            ) : cell.getIsAggregated() ? (
              flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
            ) : null
          } else {
            content = flexRender(cell.column.columnDef.cell, cell.getContext())
          }
          return (
            <TableCell
              key={cell.id}
              rowSpan={span && span > 1 ? span : undefined}
              className={cn(meta?.className, meta?.mergeRows && "border-r align-middle")}
              // Leaf rows under groups are indented like their group label.
              style={isLabel && !row.getIsGrouped() ? { paddingLeft: `${0.5 + row.depth * 1.5 + 1.75}rem` } : undefined}
            >
              {row.getIsGrouped() && isLabel ? content : <CellContent overflow={meta?.overflow}>{content}</CellContent>}
            </TableCell>
          )
        })}
      </TableRow>
    ))
  ) : (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={visibleColumns.length} className="h-24 text-center text-muted-foreground">
        {emptyState}
      </TableCell>
    </TableRow>
  )

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id] && !table.getRowModel().rowsById[id]?.getIsGrouped()
  )

  return (
    <div
      className={cn(
        "group/table flex flex-col gap-4",
        // Vertical body borders; header cells get theirs in renderHeaderRows
        // (in a multi-row header the last cell of a row isn't always the last column).
        bordered && "[&_td:not(:last-child)]:border-r",
        className
      )}
      data-overflow-x={overflowX || undefined}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchDebounceMs={searchDebounceMs}
        filters={filters}
        enableColumnVisibility={enableColumnVisibility}
        actions={toolbarActions}
        bulkActions={bulkActions}
        enableGrouping={enableGrouping}
      />
      {maxBodyHeight === undefined ? (
        <div className="overflow-hidden rounded-lg border">
          <div ref={scrollerRef} className="relative w-full overflow-x-auto">
            <table data-slot="table" className="w-full caption-bottom text-sm">
              <TableHeader>{headerRows}</TableHeader>
              <TableBody>{bodyRows}</TableBody>
            </table>
          </div>
        </div>
      ) : stickyHeader ? (
        <ScrollBodyTable
          table={table}
          bodyRef={scrollerRef}
          maxBodyHeight={maxBodyHeight}
          header={headerRows}
          body={bodyRows}
        />
      ) : (
        <div ref={scrollerRef} className="overflow-auto rounded-lg border" style={{ maxHeight: maxBodyHeight }}>
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
          selectedCount={selectedIds.length}
        />
      )}
    </div>
  )
}

/**
 * Header and body are two tables sharing the same column widths, so the
 * vertical scrollbar only spans the body. `scrollbar-gutter: stable` keeps
 * both the same width; horizontal scrolling of the body drives the header.
 * Column widths come from `size` in the column defs (TanStack default 150);
 * spare width goes to the data columns only (see `columnWidths`).
 */
function ScrollBodyTable<TData>({
  table,
  bodyRef,
  maxBodyHeight,
  header,
  body,
}: {
  table: TanstackTable<TData>
  bodyRef: RefObject<HTMLDivElement | null>
  maxBodyHeight: number | string
  header: ReactNode
  body: ReactNode
}) {
  "use no memo"

  const headerRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(0)

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    // Fires once on observe, then on every resize.
    const observer = new ResizeObserver(() => setAvailable(body.clientWidth))
    observer.observe(body)
    return () => observer.disconnect()
  }, [bodyRef])

  const columns = table.getVisibleLeafColumns()
  const widths = columnWidths(columns, available)
  const width = widths.reduce((sum, w) => sum + w, 0)
  const colgroup = (
    <colgroup>
      {columns.map((column, i) => (
        <col key={column.id} style={{ width: widths[i] }} />
      ))}
    </colgroup>
  )
  const tableClass = "table-fixed caption-bottom text-sm"

  return (
    <div className="overflow-hidden rounded-lg border">
      <div ref={headerRef} className="overflow-hidden [scrollbar-gutter:stable]">
        <table className={tableClass} style={{ width }}>
          {colgroup}
          <TableHeader>{header}</TableHeader>
        </table>
      </div>
      <div
        ref={bodyRef}
        className="overflow-auto [scrollbar-gutter:stable]"
        style={{ maxHeight: maxBodyHeight }}
        onScroll={(event) => {
          if (headerRef.current) headerRef.current.scrollLeft = event.currentTarget.scrollLeft
        }}
      >
        <table className={tableClass} style={{ width }}>
          {colgroup}
          <TableBody>{body}</TableBody>
        </table>
      </div>
    </div>
  )
}

/**
 * Column widths for the split tables: each column's `size`, plus — when the
 * container is wider — the spare width shared by the columns that are not
 * `meta.fixedWidth`, in proportion to their size. (A plain `width: 100%`
 * fixed-layout table would stretch every column, actions included.)
 */
function columnWidths<TData>(columns: Column<TData, unknown>[], available: number) {
  const sizes = columns.map((column) => column.getSize())
  const spare = available - sizes.reduce((sum, size) => sum + size, 0)
  const flexible = (column: Column<TData, unknown>) => !column.columnDef.meta?.fixedWidth
  const flexTotal = columns.reduce((sum, column, i) => sum + (flexible(column) ? sizes[i] : 0), 0)
  if (spare <= 0 || flexTotal === 0) return sizes
  const widths = columns.map((column, i) =>
    flexible(column) ? sizes[i] + Math.floor((spare * sizes[i]) / flexTotal) : sizes[i]
  )
  // Whole pixels only (no stray horizontal scrollbar); the rounding rest
  // goes to the last flexible column.
  const last = columns.findLastIndex(flexible)
  widths[last] += available - widths.reduce((sum, w) => sum + w, 0)
  return widths
}

/**
 * Body cell content per `meta.overflow`. `truncate` cuts long text with an
 * ellipsis via TruncatedText, full text in the app-wide tooltip (needs a
 * bounded width: always true with `maxBodyHeight`; in the auto layout
 * columns grow to fit, unless you cap them, e.g. `max-w-60` in `meta.className`).
 */
function CellContent({
  overflow = "truncate",
  children,
}: {
  overflow?: "truncate" | "wrap" | "visible"
  children: ReactNode
}) {
  if (overflow === "visible") return children
  if (overflow === "truncate") return <TruncatedText>{children}</TruncatedText>
  return <div className="break-words whitespace-normal">{children}</div>
}

function selectedOriginals<TData>(table: TanstackTable<TData>, ids: string[]) {
  const rowsById = table.getCoreRowModel().rowsById
  return ids.map((id) => rowsById[id]?.original).filter((row): row is TData => row !== undefined)
}

/**
 * Header rows for grouped column defs (`columns: [...]`): group headers
 * span their children (colSpan, centered); a column without a group above
 * it spans the empty rows instead of leaving holes (rowSpan).
 */
function renderHeaderRows<TData>(table: TanstackTable<TData>, bordered: boolean) {
  const groups = table.getHeaderGroups()
  const rendered = new Set<string>()
  const lastColumnId = table.getVisibleLeafColumns().at(-1)?.id
  return groups.map((group, depth) => (
    <TableRow key={group.id} className="hover:bg-transparent">
      {group.headers.map((header) => {
        if (rendered.has(header.column.id)) return null
        rendered.add(header.column.id)
        // Rows further down where this column shows again (as a placeholder or for real).
        let rowSpan = 1
        let real: Header<TData, unknown> = header
        for (const below of groups.slice(depth + 1)) {
          const same = below.headers.find((h) => h.column.id === header.column.id)
          if (!same) break
          rowSpan++
          if (!same.isPlaceholder) real = same
        }
        const isGroup = real.subHeaders.length > 0 && !real.isPlaceholder
        const atRightEdge = header.getLeafHeaders().at(-1)?.column.id === lastColumnId
        return (
          <TableHead
            key={header.id}
            colSpan={header.colSpan}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            className={cn(
              real.column.columnDef.meta?.className,
              isGroup && "text-center",
              groups.length > 1 && "border-b",
              bordered && !atRightEdge && "border-r"
            )}
          >
            {real.isPlaceholder ? null : flexRender(real.column.columnDef.header, real.getContext())}
          </TableHead>
        )
      })}
    </TableRow>
  ))
}

/** Group row label: +/− toggle (indented by depth), "Column: value" and the row count. */
function GroupLabel<TData>({
  row,
  table,
  renderGroupRow,
}: {
  row: Row<TData>
  table: TanstackTable<TData>
  renderGroupRow?: (row: Row<TData>) => ReactNode
}) {
  const column = row.groupingColumnId ? table.getColumn(row.groupingColumnId) : undefined
  const header = column?.columnDef.meta?.label ?? (typeof column?.columnDef.header === "string" ? column.columnDef.header : column?.id)
  const Icon = row.getIsExpanded() ? MinusIcon : PlusIcon
  return (
    <div className="flex items-center gap-2" style={{ paddingLeft: `${row.depth * 1.5}rem` }}>
      <button
        type="button"
        aria-label={row.getIsExpanded() ? "Collapse group" : "Expand group"}
        aria-expanded={row.getIsExpanded()}
        onClick={row.getToggleExpandedHandler()}
        className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Icon className="size-3" />
      </button>
      <span className="truncate">
        {renderGroupRow ? renderGroupRow(row) : `${header}: ${String(row.groupingValue ?? "—")}`}
      </span>
      <span className="text-xs font-normal text-muted-foreground tabular-nums">({row.getLeafRows().filter((leaf) => !leaf.getIsGrouped()).length})</span>
    </div>
  )
}

/**
 * rowSpan of each body cell for columns with `meta.mergeRows`, keyed
 * `${rowId}:${columnId}`: n on the first row of a run of equal values, 0 on
 * the rows it covers. A merged column only merges inside the runs of the
 * merged columns before it.
 */
function mergedRowSpans<TData>(rows: Row<TData>[], columns: Column<TData, unknown>[]) {
  const merged = columns.filter((column) => column.columnDef.meta?.mergeRows)
  if (!merged.length || !rows.length) return undefined
  const spans = new Map<string, number>()
  const breaks = new Set<number>([0])
  for (const column of merged) {
    let start = 0
    const value = (i: number) => rows[i].getValue(column.id)
    for (let i = 1; i <= rows.length; i++) {
      if (i < rows.length && !breaks.has(i) && Object.is(value(i), value(start))) continue
      spans.set(`${rows[start].id}:${column.id}`, i - start)
      for (let j = start + 1; j < i; j++) spans.set(`${rows[j].id}:${column.id}`, 0)
      breaks.add(i)
      start = i
    }
  }
  return spans
}

function selectionColumn<TData, TValue>(
  type: "checkbox" | "radio",
  selectAllMode: "page" | "all",
  pinned: boolean
): ColumnDef<TData, TValue> {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    meta: { className: cn("w-10", pinned && pinnedLeftClass), fixedWidth: true, overflow: "visible" },
    header: ({ table }) => {
      if (type === "radio") return <span className="sr-only">Select</span>
      const all = selectAllMode === "all"
      return (
        <Checkbox
          aria-label={all ? "Select all rows" : "Select all rows on this page"}
          checked={
            all
              ? table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")
              : table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            all ? table.toggleAllRowsSelected(!!value) : table.toggleAllPageRowsSelected(!!value)
          }
        />
      )
    },
    cell: ({ row }) => {
      if (type === "radio") {
        if (row.getIsGrouped()) return null
        return (
          <button
            type="button"
            role="radio"
            aria-label="Select row"
            aria-checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onClick={() => row.toggleSelected(true)}
            className="flex size-4 items-center justify-center rounded-full border border-input outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-checked:border-primary"
          >
            {row.getIsSelected() && <span className="size-2 rounded-full bg-primary" />}
          </button>
        )
      }
      // Group rows: checked when all children are, a dash when some are.
      const checked = row.getIsGrouped()
        ? row.getIsAllSubRowsSelected() || (row.getIsSomeSelected() && "indeterminate")
        : row.getIsSelected()
      return (
        <Checkbox
          aria-label={row.getIsGrouped() ? "Select group" : "Select row"}
          checked={checked}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      )
    },
  }
}

// Mirror of pinnedRightClass for the checkbox column (divider on its right).
const pinnedLeftClass = [
  "group-data-[overflow-x=true]/table:sticky",
  "group-data-[overflow-x=true]/table:left-0",
  "group-data-[overflow-x=true]/table:z-[1]",
  "group-data-[overflow-x=true]/table:bg-background",
  "group-data-[overflow-x=true]/table:shadow-[inset_-1px_0_0_var(--border)]",
  "group-data-[overflow-x=true]/table:group-hover/row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))]",
  "group-data-[overflow-x=true]/table:group-data-[state=selected]/row:bg-muted",
].join(" ")

// Only while the table overflows horizontally (data-overflow-x on the
// wrapper): stick to the right with a divider, in colors that match
// TableRow's hover / selected states but opaque, so content scrolling
// underneath stays hidden. Otherwise it is a plain column.
const pinnedRightClass = [
  "group-data-[overflow-x=true]/table:sticky",
  "group-data-[overflow-x=true]/table:right-0",
  "group-data-[overflow-x=true]/table:z-[1]",
  "group-data-[overflow-x=true]/table:bg-background",
  "group-data-[overflow-x=true]/table:shadow-[inset_1px_0_0_var(--border)]",
  "group-data-[overflow-x=true]/table:group-hover/row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))]",
  "group-data-[overflow-x=true]/table:group-data-[state=selected]/row:bg-muted",
].join(" ")

function actionsColumn<TData, TValue>(
  rowActions: (row: TData) => RowAction<TData>[],
  display: RowActionDisplay,
  size: number,
  pinned: boolean
): ColumnDef<TData, TValue> {
  return {
    id: "actions",
    size,
    enableSorting: false,
    enableHiding: false,
    // w-px: shrink to the buttons in the auto layout (no maxBodyHeight).
    meta: {
      className: cn("w-px whitespace-nowrap text-right", pinned && pinnedRightClass),
      fixedWidth: true,
      overflow: "visible",
    },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DataTableRowActions row={row.original} actions={rowActions(row.original)} display={display} />
    ),
  }
}
