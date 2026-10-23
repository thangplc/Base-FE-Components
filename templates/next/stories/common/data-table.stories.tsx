import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect, useState } from "react"
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"
import { CopyIcon, DownloadIcon, PencilIcon, PlusIcon, SearchXIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { DataTable, type RowAction } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { makePayments, paymentColumns, paymentFilters, payments, type Payment } from "../_data/payments"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const rowActions = (row: Payment): RowAction<Payment>[] => [
  { label: "Edit", icon: PencilIcon, onClick: () => toast(`Edit ${row.id}`) },
  {
    label: "Copy ID",
    icon: CopyIcon,
    onClick: () => {
      navigator.clipboard.writeText(row.id)
      toast.success("ID copied")
    },
  },
  {
    label: "Refund",
    onClick: () => toast(`Refund ${row.id}`),
    disabled: row.status !== "paid",
  },
  {
    label: "Delete",
    icon: Trash2Icon,
    variant: "destructive",
    confirm: { title: `Delete ${row.id}?`, description: "This payment will be permanently removed." },
    onClick: async () => {
      await wait(800)
      toast.success(`${row.id} deleted`)
    },
  },
]

const meta = {
  title: "Common/DataTable",
  component: DataTable<Payment>,
  parameters: { layout: "padded" },
  args: {
    columns: paymentColumns,
    data: payments,
    getRowId: (row) => row.id,
    searchPlaceholder: "Search payments...",
  },
} satisfies Meta<typeof DataTable<Payment>>

export default meta
type Story = StoryObj<typeof meta>

/** Search (debounced), click headers to sort (Shift + click with enableMultiSort), pagination, column visibility. */
export const Default: Story = {
  args: { enableMultiSort: true, defaultSorting: [{ id: "createdAt", desc: true }] },
}

/** select, multi-select, number-range and date-range filters, with facet counts and Reset. */
export const Filters: Story = {
  args: { filters: paymentFilters },
}

/** Actions column at the end: icons, disabled items, destructive + confirm (async). */
export const RowActions: Story = {
  args: { rowActions },
}

/**
 * `rowActionsDisplay="inline"`: every action is its own button. Icon actions
 * become icon buttons with a tooltip; actions without an icon become text buttons.
 */
export const RowActionsInline: Story = {
  args: { rowActions, rowActionsDisplay: "inline" },
}

/** Per-action `display`: Edit and Delete shown inline, the rest stay in the "…" menu. */
export const RowActionsMixed: Story = {
  args: {
    rowActions: (row) =>
      rowActions(row).map((action) =>
        action.label === "Edit" || action.label === "Delete" ? { ...action, display: "inline" } : action
      ),
  },
}

/** Checkbox column + bulk actions replacing the toolbar while rows are selected. */
export const RowSelection: Story = {
  args: {
    enableRowSelection: (row) => row.status !== "failed",
    onRowSelectionChange: (rows) => console.log("selected", rows),
    bulkActions: (rows, { clear }) => (
      <>
        <Button size="sm" variant="outline" onClick={() => toast(`Export ${rows.length} rows`)}>
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            toast.success(`Deleted ${rows.length} rows`)
            clear()
          }}
        >
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
      </>
    ),
  },
}

/**
 * maxBodyHeight: the header stays fixed and the scrollbar only spans the
 * body. Narrow the window to see horizontal scrolling with the actions
 * column pinned on the right.
 */
export const StickyHeaderAndScroll: Story = {
  args: {
    data: makePayments(200),
    pageSize: 50,
    maxBodyHeight: 360,
    rowActions,
    filters: paymentFilters,
    toolbarActions: (
      <Button>
        <PlusIcon data-icon="inline-start" />
        New payment
      </Button>
    ),
  },
}

type LongPayment = Payment & { note: string }

const longPayments: LongPayment[] = payments.map((payment, i) => ({
  ...payment,
  customer:
    i % 3 === 0 ? `${payment.customer} International Holdings Corporation Limited` : payment.customer,
  note:
    i % 2 === 0
      ? "Customer asked to split the invoice into two payments and to send the receipt to the finance team."
      : "—",
}))

const longColumns: ColumnDef<LongPayment>[] = [
  ...(paymentColumns as ColumnDef<LongPayment>[]),
  { accessorKey: "note", header: "Note", size: 260, meta: { label: "Note", overflow: "wrap" } },
]

/**
 * Long values are cut with an ellipsis (hover to read the full text) instead of
 * spilling over the next column. The Note column uses `meta.overflow: "wrap"`.
 */
export const LongContent: Story = {
  render: () => (
    <DataTable
      columns={longColumns}
      data={longPayments}
      getRowId={(row) => row.id}
      searchPlaceholder="Search payments..."
      maxBodyHeight={420}
      rowActions={rowActions as (row: LongPayment) => RowAction<LongPayment>[]}
      rowActionsDisplay="inline"
    />
  ),
}

export const RowClick: Story = {
  args: {
    rowActions,
    onRowClick: (row) => toast(`Open ${row.id}`, { description: row.customer }),
  },
}

export const Loading: Story = {
  args: { isLoading: true, data: [] },
}

export const Empty: Story = {
  args: {
    data: [],
    emptyState: (
      <EmptyState
        icon={<SearchXIcon />}
        title="No payments found"
        description="Try a different search or clear the filters."
      />
    ),
  },
}

// --- Server-side --------------------------------------------------------

const serverRows = makePayments(1234)

/** Pretends to be an API: search, filter, sort and paginate on the "server". */
async function fetchPayments(query: {
  search: string
  filters: ColumnFiltersState
  sorting: SortingState
  pagination: PaginationState
}) {
  await wait(500)
  let rows = serverRows.filter((row) =>
    `${row.id} ${row.customer} ${row.email}`.toLowerCase().includes(query.search.toLowerCase())
  )
  for (const filter of query.filters) {
    const values = filter.value as string[]
    rows = rows.filter((row) => values.includes(String(row[filter.id as keyof Payment])))
  }
  const sort = query.sorting[0]
  if (sort) {
    const key = sort.id as keyof Payment
    rows = [...rows].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (sort.desc ? -1 : 1))
  }
  const { pageIndex, pageSize } = query.pagination
  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length }
}

function ServerSideDemo() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  // Loading is derived: the last result belongs to an older query.
  const key = JSON.stringify({ search, filters, sorting, pagination })
  const [result, setResult] = useState({ key: "", rows: [] as Payment[], total: 0 })
  const loading = result.key !== key

  useEffect(() => {
    let cancelled = false
    fetchPayments(JSON.parse(key)).then((data) => {
      if (!cancelled) setResult({ key, ...data })
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return (
    <DataTable
      columns={paymentColumns}
      data={result.rows}
      getRowId={(row) => row.id}
      isLoading={loading}
      searchPlaceholder="Search on the server..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={paymentFilters.filter((filter) => filter.type === "multi-select")}
      columnFilters={filters}
      onColumnFiltersChange={setFilters}
      sorting={sorting}
      onSortingChange={setSorting}
      pagination={pagination}
      onPaginationChange={setPagination}
      manualFiltering
      manualSorting
      manualPagination
      rowCount={result.total}
    />
  )
}

/**
 * Everything controlled from outside + `manual*` flags: the table only
 * renders what the "API" returns (1,234 rows, 500 ms latency).
 */
export const ServerSide: Story = {
  render: () => <ServerSideDemo />,
}

/**
 * `selectAllMode="all"`: the header checkbox selects every filtered row,
 * not just the page. Narrow the window: the checkbox column stays pinned
 * on the left (`selectionColumnPinned`, default) while the rest scrolls.
 */
export const SelectAllFiltered: Story = {
  args: {
    enableRowSelection: true,
    selectAllMode: "all",
    filters: paymentFilters,
    maxBodyHeight: 360,
    rowActions,
    bulkActions: (rows) => <span className="text-sm text-muted-foreground">across all pages: {rows.length}</span>,
  },
}

/** `selectionType="radio"`: one row at a time. */
export const RadioSelection: Story = {
  args: { enableRowSelection: true, selectionType: "radio", pageSize: 5 },
}

function ControlledSelectionDemo() {
  const [ids, setIds] = useState<string[]>(["PAY-0002", "PAY-0015"])
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        columns={paymentColumns}
        data={payments}
        getRowId={(row) => row.id}
        enableRowSelection
        pageSize={5}
        rowSelection={ids}
        onRowSelectionChange={(_, next) => setIds(next)}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setIds(payments.filter((p) => p.status === "paid").map((p) => p.id))}>
          Select all paid
        </Button>
        <code className="text-xs text-muted-foreground">{JSON.stringify(ids)}</code>
      </div>
    </div>
  )
}

/** Controlled `rowSelection` (ids from getRowId): kept across pages, set from outside. */
export const ControlledSelection: Story = { render: () => <ControlledSelectionDemo /> }

const groupedHeaderColumns: ColumnDef<Payment>[] = [
  paymentColumns[0],
  { id: "customerGroup", header: "Customer", columns: [paymentColumns[1], paymentColumns[2]] },
  {
    id: "paymentGroup",
    header: "Payment",
    columns: [paymentColumns[3], { id: "details", header: "Details", columns: [paymentColumns[4], paymentColumns[5]] }],
  },
  paymentColumns[6],
]

/**
 * Group column headers: nest `columns` in a column def (here two levels).
 * Columns without a group span the header rows; `bordered` adds vertical
 * dividers. Works with the sticky header too.
 */
export const GroupedHeaders: Story = {
  args: {
    columns: groupedHeaderColumns,
    bordered: true,
    enableRowSelection: true,
    maxBodyHeight: 360,
  },
}

const groupingColumns: ColumnDef<Payment>[] = paymentColumns.map((column) =>
  "accessorKey" in column && column.accessorKey === "amount"
    ? {
        ...column,
        aggregationFn: "sum",
        aggregatedCell: ({ getValue }) => (
          <span className="font-medium tabular-nums">${(getValue() as number).toFixed(2)}</span>
        ),
      }
    : column
)

/**
 * Group rows: `defaultGrouping={["status"]}`, a +/− per group with the
 * row count, and `aggregationFn: "sum"` on Amount for a subtotal. The
 * "Group" menu (enableGrouping) adds or removes levels; ticking a group
 * selects its rows.
 */
export const Grouping: Story = {
  args: {
    columns: groupingColumns,
    defaultGrouping: ["status"],
    enableGrouping: true,
    enableRowSelection: true,
    pageSize: 20,
  },
}

/** Two levels (status → method), groups start collapsed, and pages count top-level groups. */
export const GroupingNested: Story = {
  args: {
    columns: groupingColumns,
    defaultGrouping: ["status", "method"],
    defaultExpanded: false,
    paginateGroups: true,
    enableGrouping: true,
    pageSize: 2,
  },
}

const mergeColumns: ColumnDef<Payment>[] = [
  { ...paymentColumns[3], meta: { ...paymentColumns[3].meta, mergeRows: true } },
  { ...paymentColumns[4], meta: { ...paymentColumns[4].meta, mergeRows: true } },
  paymentColumns[0],
  paymentColumns[1],
  paymentColumns[5],
]

/**
 * `meta.mergeRows`: equal values in a row run share one cell (rowSpan),
 * Method nested inside Status. Sort by the merged columns first.
 */
export const MergedCells: Story = {
  args: {
    columns: mergeColumns,
    // Methods spread over every status, so Method runs nest inside Status runs.
    data: payments
      .map((p, i) => ({ ...p, method: (["card", "bank", "paypal"] as const)[Math.floor(i / 2) % 3] }))
      .sort((a, b) => a.status.localeCompare(b.status) || a.method.localeCompare(b.method)),
    bordered: true,
    pageSize: 20,
    searchPlaceholder: undefined,
  },
}
