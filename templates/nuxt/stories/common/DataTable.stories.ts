import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/vue-table'
import type { ConcreteComponent } from 'vue'
import type { RowAction } from '@/components/common/data-table/types'
import type { Payment } from '../_data/payments'
import { CopyIcon, DownloadIcon, PencilIcon, PlusIcon, SearchXIcon, Trash2Icon } from '@lucide/vue'
import { h, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import DataTable from '@/components/common/data-table/DataTable.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Button } from '@/components/ui/button'
import { makePayments, paymentColumns, paymentFilters, payments } from '../_data/payments'

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function rowActions(row: Payment): RowAction<Payment>[] {
  return [
    { label: 'Edit', icon: PencilIcon, onClick: () => toast(`Edit ${row.id}`) },
    {
      label: 'Copy ID',
      icon: CopyIcon,
      onClick: () => {
        navigator.clipboard.writeText(row.id)
        toast.success('ID copied')
      },
    },
    { label: 'Refund', onClick: () => toast(`Refund ${row.id}`), disabled: row.status !== 'paid' },
    {
      label: 'Delete',
      icon: Trash2Icon,
      variant: 'destructive',
      confirm: { title: `Delete ${row.id}?`, description: 'This payment will be permanently removed.' },
      onClick: async () => {
        await wait(800)
        toast.success(`${row.id} deleted`)
      },
    },
  ]
}

const meta = {
  title: 'Common/DataTable',
  // Generic SFC: cast for Storybook's types (the Docs props table still reads the .vue file).
  component: DataTable as unknown as ConcreteComponent,
  parameters: { layout: 'padded' },
  args: {
    columns: paymentColumns,
    data: payments,
    getRowId: (row: Payment) => row.id,
    searchPlaceholder: 'Search payments...',
  },
  render: args => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" />',
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Search (debounced), click headers to sort (Shift + click with enableMultiSort), pagination, column visibility. */
export const Default: Story = {
  args: { enableMultiSort: true, defaultSorting: [{ id: 'createdAt', desc: true }] },
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
 * `row-actions-display="inline"`: every action is its own button. Icon actions
 * become icon buttons with a tooltip; actions without an icon become text buttons.
 */
export const RowActionsInline: Story = {
  args: { rowActions, rowActionsDisplay: 'inline' },
}

/** Per-action `display`: Edit and Delete shown inline, the rest stay in the "…" menu. */
export const RowActionsMixed: Story = {
  args: {
    rowActions: (row: Payment) =>
      rowActions(row).map(action =>
        action.label === 'Edit' || action.label === 'Delete' ? { ...action, display: 'inline' } : action,
      ),
  },
}

/** Checkbox column + `#bulk-actions` replacing the toolbar while rows are selected. */
export const RowSelection: Story = {
  args: { enableRowSelection: (row: Payment) => row.status !== 'failed' },
  render: args => ({
    components: { DataTable, Button, DownloadIcon, Trash2Icon },
    setup: () => ({
      args,
      onSelection: (rows: Payment[]) => console.log('selected', rows),
      exportRows: (rows: Payment[]) => toast(`Export ${rows.length} rows`),
      deleteRows: (rows: Payment[], clear: () => void) => {
        toast.success(`Deleted ${rows.length} rows`)
        clear()
      },
    }),
    template: `
      <DataTable v-bind="args" @selection-change="onSelection">
        <template #bulk-actions="{ rows, clear }">
          <Button size="sm" variant="outline" @click="exportRows(rows)">
            <DownloadIcon data-icon="inline-start" />Export
          </Button>
          <Button size="sm" variant="destructive" @click="deleteRows(rows, clear)">
            <Trash2Icon data-icon="inline-start" />Delete
          </Button>
        </template>
      </DataTable>
    `,
  }),
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
  },
  render: args => ({
    components: { DataTable, Button, PlusIcon },
    setup: () => ({ args }),
    template: `
      <DataTable v-bind="args">
        <template #toolbar-actions>
          <Button><PlusIcon data-icon="inline-start" />New payment</Button>
        </template>
      </DataTable>
    `,
  }),
}

type LongPayment = Payment & { note: string }

const longPayments: LongPayment[] = payments.map((payment, i) => ({
  ...payment,
  customer: i % 3 === 0 ? `${payment.customer} International Holdings Corporation Limited` : payment.customer,
  note: i % 2 === 0
    ? 'Customer asked to split the invoice into two payments and to send the receipt to the finance team.'
    : '—',
}))

const longColumns: ColumnDef<LongPayment>[] = [
  ...(paymentColumns as ColumnDef<LongPayment>[]),
  { accessorKey: 'note', header: 'Note', size: 260, meta: { label: 'Note', overflow: 'wrap' } },
]

/**
 * Long values are cut with an ellipsis (hover to read the full text) instead of
 * spilling over the next column. The Note column uses `meta.overflow: 'wrap'`.
 */
export const LongContent: Story = {
  args: {
    columns: longColumns,
    data: longPayments,
    maxBodyHeight: 420,
    rowActions,
    rowActionsDisplay: 'inline',
  },
}

export const RowClick: Story = {
  args: {
    rowActions,
    onRowClick: (row: Payment) => toast(`Open ${row.id}`, { description: row.customer }),
  },
}

export const Loading: Story = {
  args: { isLoading: true, data: [] },
}

export const Empty: Story = {
  args: { data: [] },
  render: args => ({
    components: { DataTable, EmptyState, SearchXIcon },
    setup: () => ({ args }),
    template: `
      <DataTable v-bind="args">
        <template #empty>
          <EmptyState title="No payments found" description="Try a different search or clear the filters.">
            <template #icon><SearchXIcon /></template>
          </EmptyState>
        </template>
      </DataTable>
    `,
  }),
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
  let rows = serverRows.filter(row =>
    `${row.id} ${row.customer} ${row.email}`.toLowerCase().includes(query.search.toLowerCase()),
  )
  for (const filter of query.filters) {
    const values = filter.value as string[]
    rows = rows.filter(row => values.includes(String(row[filter.id as keyof Payment])))
  }
  const sort = query.sorting[0]
  if (sort) {
    const key = sort.id as keyof Payment
    rows = [...rows].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (sort.desc ? -1 : 1))
  }
  const { pageIndex, pageSize } = query.pagination
  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length }
}

/**
 * Everything bound with v-model + `manual*` flags: the table only renders
 * what the "API" returns (1,234 rows, 500 ms latency).
 */
export const ServerSide: Story = {
  render: () => ({
    components: { DataTable },
    setup() {
      const search = ref('')
      const filters = ref<ColumnFiltersState>([])
      const sorting = ref<SortingState>([])
      const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
      const rows = ref<Payment[]>([])
      const total = ref(0)
      const loading = ref(true)
      let request = 0

      watch([search, filters, sorting, pagination], async () => {
        const id = ++request
        loading.value = true
        const result = await fetchPayments({
          search: search.value,
          filters: filters.value,
          sorting: sorting.value,
          pagination: pagination.value,
        })
        if (id !== request)
          return
        rows.value = result.rows
        total.value = result.total
        loading.value = false
      }, { immediate: true, deep: true })

      return {
        search,
        filters,
        sorting,
        pagination,
        rows,
        total,
        loading,
        columns: paymentColumns,
        multiSelectFilters: paymentFilters.filter(filter => filter.type === 'multi-select'),
      }
    },
    template: `
      <DataTable
        v-model:search="search"
        v-model:column-filters="filters"
        v-model:sorting="sorting"
        v-model:pagination="pagination"
        :columns="columns"
        :data="rows"
        :get-row-id="(row) => row.id"
        :is-loading="loading"
        :filters="multiSelectFilters"
        :row-count="total"
        search-placeholder="Search on the server..."
        manual-filtering
        manual-sorting
        manual-pagination
      />
    `,
  }),
}

/**
 * `select-all-mode="all"`: the header checkbox selects every filtered row,
 * not just the page. Narrow the window: the checkbox column stays pinned
 * on the left (`selection-column-pinned`, default) while the rest scrolls.
 */
export const SelectAllFiltered: Story = {
  render: () => ({
    components: { DataTable },
    setup: () => ({ paymentColumns, payments, paymentFilters, rowActions }),
    template: `
      <DataTable
        :columns="paymentColumns"
        :data="payments"
        :get-row-id="row => row.id"
        search-placeholder="Search payments..."
        enable-row-selection
        select-all-mode="all"
        :filters="paymentFilters"
        :max-body-height="360"
        :row-actions="rowActions"
      >
        <template #bulk-actions="{ rows }">
          <span class="text-sm text-muted-foreground">across all pages: {{ rows.length }}</span>
        </template>
      </DataTable>
    `,
  }),
}

/** `selection-type="radio"`: one row at a time. */
export const RadioSelection: Story = {
  args: { enableRowSelection: true, selectionType: 'radio', pageSize: 5 },
}

/** `v-model:row-selection` (ids from get-row-id): kept across pages, set from outside. */
export const ControlledSelection: Story = {
  render: () => ({
    components: { DataTable, Button },
    setup: () => ({
      paymentColumns,
      payments,
      ids: ref<string[]>(['PAY-0002', 'PAY-0015']),
      paid: payments.filter(p => p.status === 'paid').map(p => p.id),
    }),
    template: `
      <div class="flex flex-col gap-3">
        <DataTable
          v-model:row-selection="ids"
          :columns="paymentColumns"
          :data="payments"
          :get-row-id="row => row.id"
          enable-row-selection
          :page-size="5"
        />
        <div class="flex items-center gap-2">
          <Button size="sm" variant="outline" @click="ids = paid">Select all paid</Button>
          <code class="text-xs text-muted-foreground">{{ JSON.stringify(ids) }}</code>
        </div>
      </div>
    `,
  }),
}

const [invoice, customer, email, status, method, amount, created] = paymentColumns as [
  ColumnDef<Payment>, ColumnDef<Payment>, ColumnDef<Payment>, ColumnDef<Payment>,
  ColumnDef<Payment>, ColumnDef<Payment>, ColumnDef<Payment>,
]

const groupedHeaderColumns: ColumnDef<Payment>[] = [
  invoice,
  { id: 'customerGroup', header: 'Customer', columns: [customer, email] },
  { id: 'paymentGroup', header: 'Payment', columns: [status, { id: 'details', header: 'Details', columns: [method, amount] }] },
  created,
]

/**
 * Group column headers: nest `columns` in a column def (here two levels).
 * Columns without a group span the header rows; `bordered` adds vertical
 * dividers. Works with the sticky header too.
 */
export const GroupedHeaders: Story = {
  args: { columns: groupedHeaderColumns, bordered: true, enableRowSelection: true, maxBodyHeight: 360 },
}

const groupingColumns: ColumnDef<Payment>[] = paymentColumns.map(column =>
  'accessorKey' in column && column.accessorKey === 'amount'
    ? {
        ...column,
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }) => h('span', { class: 'font-medium tabular-nums' }, `$${(getValue() as number).toFixed(2)}`),
      }
    : column,
)

/**
 * Group rows: `default-grouping` ['status'], a +/− per group with the row
 * count, and `aggregationFn: 'sum'` on Amount for a subtotal. The "Group"
 * menu (enable-grouping) adds or removes levels; ticking a group selects its rows.
 */
export const Grouping: Story = {
  args: { columns: groupingColumns, defaultGrouping: ['status'], enableGrouping: true, enableRowSelection: true, pageSize: 20 },
}

/** Two levels (status → method), groups start collapsed, and pages count top-level groups. */
export const GroupingNested: Story = {
  args: {
    columns: groupingColumns,
    defaultGrouping: ['status', 'method'],
    defaultExpanded: false,
    paginateGroups: true,
    enableGrouping: true,
    pageSize: 2,
  },
}

/**
 * `meta.mergeRows`: equal values in a row run share one cell (rowSpan),
 * Method nested inside Status. Sort by the merged columns first.
 */
export const MergedCells: Story = {
  args: {
    columns: [
      { ...status, meta: { ...status.meta, mergeRows: true } },
      { ...method, meta: { ...method.meta, mergeRows: true } },
      invoice,
      customer,
      amount,
    ],
    // Methods spread over every status, so Method runs nest inside Status runs.
    data: payments
      .map((p, i) => ({ ...p, method: (['card', 'bank', 'paypal'] as const)[Math.floor(i / 2) % 3]! }))
      .sort((a, b) => a.status.localeCompare(b.status) || a.method.localeCompare(b.method)),
    bordered: true,
    pageSize: 20,
    searchPlaceholder: undefined,
  },
}
