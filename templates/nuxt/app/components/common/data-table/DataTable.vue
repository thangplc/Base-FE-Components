<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/vue-table'
import type { HTMLAttributes } from 'vue'
import type { DataTableFilter, RowAction, RowActionDisplay } from './types'
import {
  FlexRender,
  functionalUpdate,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { useResizeObserver } from '@vueuse/core'
import { computed, ref } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, valueUpdater } from '@/lib/utils'
import DataTablePagination from './DataTablePagination.vue'
import { columnWidths } from './column-widths'
import DataTableToolbar from './DataTableToolbar.vue'
import { filterFnByType } from './filter-fns'
import { actionsColumn, selectionColumn } from './helpers'
import { estimateRowActionsWidth } from './row-actions'

/**
 * Data table on top of TanStack Table: search, sort, filters, row actions,
 * selection, sticky header with a body-only scrollbar, and pagination.
 *
 * Search, sorting, filters and pagination work out of the box, or can be
 * bound with v-model (`v-model:search`, `v-model:sorting`,
 * `v-model:column-filters`, `v-model:pagination`) and combined with the
 * `manual*` flags to let a server do the work.
 */
const props = withDefaults(defineProps<{
  // Data
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable row id (e.g. `row => row.id`); needed for row selection across pages. */
  getRowId?: (row: TData, index: number) => string
  /** Shows skeleton rows in the body while keeping the header. */
  isLoading?: boolean
  /** Text shown when there are no rows (or use the `#empty` slot). */
  emptyState?: string
  /** Click anywhere on a row (`@row-click`); clicks on buttons, links and checkboxes are ignored. */
  onRowClick?: (row: TData) => void
  class?: HTMLAttributes['class']

  // Search
  /** Shows the search box. */
  searchPlaceholder?: string
  /** Only search these column ids (default: every text/number column). */
  searchColumns?: string[]
  searchDebounceMs?: number

  // Sorting
  defaultSorting?: SortingState
  /** Rows arrive already sorted (server-side). */
  manualSorting?: boolean
  /** Shift + click to sort by several columns. */
  enableMultiSort?: boolean

  // Filters
  filters?: DataTableFilter[]
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
  /** Rows arrive already paginated (server-side); pass `rowCount` too. */
  manualPagination?: boolean
  /** Total rows on the server when `manualPagination`. */
  rowCount?: number
  showPagination?: boolean

  // Toolbar & selection
  enableColumnVisibility?: boolean
  defaultColumnVisibility?: VisibilityState
  /** Adds a checkbox column. Pass a function to decide per row. */
  enableRowSelection?: boolean | ((row: TData) => boolean)
}>(), {
  isLoading: false,
  emptyState: 'No results.',
  manualSorting: false,
  enableMultiSort: false,
  manualFiltering: false,
  rowActionsDisplay: 'menu',
  actionsColumnPinned: true,
  stickyHeader: true,
  pageSize: 10,
  manualPagination: false,
  showPagination: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
})

const emit = defineEmits<{
  /** Selected rows (originals) after every selection change. */
  'selection-change': [rows: TData[]]
}>()

const slots = defineSlots<{
  /** Controls on the right of the toolbar, e.g. an "Add" button. */
  'toolbar-actions'?: () => unknown
  /** Toolbar content while rows are selected (delete, export...). */
  'bulk-actions'?: (props: { rows: TData[], clear: () => void }) => unknown
  /** Shown when there are no rows. */
  'empty'?: () => unknown
}>()

// Each model is owned by the table unless the parent binds it with v-model.
const sorting = defineModel<SortingState>('sorting')
const columnFilters = defineModel<ColumnFiltersState>('columnFilters')
const search = defineModel<string>('search')
const pagination = defineModel<PaginationState>('pagination')
sorting.value ??= props.defaultSorting ?? []
columnFilters.value ??= []
search.value ??= ''
pagination.value ??= { pageIndex: 0, pageSize: props.pageSize }

const columnVisibility = ref<VisibilityState>(props.defaultColumnVisibility ?? {})
const rowSelection = ref<RowSelectionState>({})

// A new search or filter always starts again from the first page.
function firstPage() {
  if (pagination.value!.pageIndex !== 0)
    pagination.value = { ...pagination.value!, pageIndex: 0 }
}

const allColumns = computed(() => {
  const withFilterFns = props.columns.map((column) => {
    const id = column.id ?? ('accessorKey' in column ? String(column.accessorKey) : undefined)
    const filter = props.filters?.find(f => f.columnId === id)
    return filter && !column.filterFn
      ? { ...column, filterFn: filterFnByType[filter.type] as FilterFn<TData> }
      : column
  }) as ColumnDef<TData>[]
  const rowActions = props.rowActions
  // Size the actions column for the widest set of actions on the first rows.
  const actionsSize = props.actionsColumnSize ?? Math.max(
    56,
    ...props.data.slice(0, 50).map(row => estimateRowActionsWidth(rowActions?.(row) ?? [], props.rowActionsDisplay)),
  )
  return [
    ...(props.enableRowSelection ? [selectionColumn<TData>()] : []),
    ...withFilterFns,
    ...(rowActions
      ? [actionsColumn<TData>(rowActions, props.rowActionsDisplay, actionsSize, props.actionsColumnPinned)]
      : []),
  ]
})

const table = useVueTable<TData>({
  get data() { return props.data },
  get columns() { return allColumns.value },
  getRowId: (row, index) => props.getRowId?.(row, index) ?? String(index),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get globalFilter() { return search.value },
    get pagination() { return pagination.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: updater => (sorting.value = functionalUpdate(updater, sorting.value!)),
  onColumnFiltersChange: (updater) => {
    columnFilters.value = functionalUpdate(updater, columnFilters.value!)
    firstPage()
  },
  onGlobalFilterChange: (updater: Updater<string>) => {
    search.value = functionalUpdate(updater, search.value!)
    firstPage()
  },
  onPaginationChange: updater => (pagination.value = functionalUpdate(updater, pagination.value!)),
  onColumnVisibilityChange: updater => valueUpdater(updater, columnVisibility),
  onRowSelectionChange: (updater) => {
    valueUpdater(updater, rowSelection)
    const rowsById = table.getCoreRowModel().rowsById
    emit('selection-change', Object.keys(rowSelection.value)
      .filter(id => rowSelection.value[id])
      .map(id => rowsById[id]?.original)
      .filter((row): row is TData => row !== undefined))
  },
  get enableRowSelection() {
    const enable = props.enableRowSelection
    return typeof enable === 'function' ? (row: Row<TData>) => enable(row.original) : enable
  },
  get enableMultiSort() { return props.enableMultiSort },
  isMultiSortEvent: event => (event as MouseEvent).shiftKey,
  get manualSorting() { return props.manualSorting },
  get manualFiltering() { return props.manualFiltering },
  get manualPagination() { return props.manualPagination },
  get rowCount() { return props.manualPagination ? props.rowCount : undefined },
  autoResetPageIndex: false,
  ...(props.searchColumns && {
    getColumnCanGlobalFilter: column => props.searchColumns!.includes(column.id),
  }),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getFacetedMinMaxValues: getFacetedMinMaxValues(),
})

/** plain: page scroll · split: fixed header + scrolling body · scroll: header scrolls with the body */
const layout = computed(() =>
  props.maxBodyHeight === undefined ? 'plain' : props.stickyHeader ? 'split' : 'scroll',
)
const visibleColumns = computed(() => table.getVisibleLeafColumns())
const skeletonRows = computed(() => Math.min(pagination.value!.pageSize, 10))
const bodyHeight = computed(() =>
  typeof props.maxBodyHeight === 'number' ? `${props.maxBodyHeight}px` : props.maxBodyHeight,
)
// Shared widths for the split header/body tables (TanStack default size: 150);
// spare width goes to the data columns only (see columnWidths).
const headerScroller = ref<HTMLDivElement>()
const bodyScroller = ref<HTMLDivElement>()
const available = ref(0)
useResizeObserver(bodyScroller, () => {
  available.value = bodyScroller.value?.clientWidth ?? 0
})
const widths = computed(() => columnWidths(visibleColumns.value, available.value))
const tableWidth = computed(() => `${widths.value.reduce((sum, w) => sum + w, 0)}px`)

function onRowClick(event: MouseEvent, row: Row<TData>) {
  if (!props.onRowClick)
    return
  // Ignore clicks from teleported content (menus, dialogs) and interactive cells.
  const target = event.target as HTMLElement
  if (!(event.currentTarget as HTMLElement).contains(target))
    return
  if (target.closest('button, a, input, label, [role=checkbox]'))
    return
  props.onRowClick(row.original)
}

function syncHeaderScroll(event: Event) {
  if (headerScroller.value)
    headerScroller.value.scrollLeft = (event.target as HTMLElement).scrollLeft
}
</script>

<template>
  <div :class="cn('flex flex-col gap-4', props.class)">
    <DataTableToolbar
      :table="table"
      :search-placeholder="searchPlaceholder"
      :search-debounce-ms="searchDebounceMs"
      :filters="filters"
      :enable-column-visibility="enableColumnVisibility"
      :has-bulk-actions="!!slots['bulk-actions']"
    >
      <slot name="toolbar-actions" />
      <template #bulk-actions="bulk">
        <slot name="bulk-actions" v-bind="bulk" />
      </template>
    </DataTableToolbar>

    <div v-if="layout === 'split'" class="overflow-hidden rounded-lg border">
      <!--
        Header and body are two tables sharing the same column widths, so
        the vertical scrollbar only spans the body. scrollbar-gutter keeps
        both the same width; horizontal body scroll drives the header.
      -->
      <div ref="headerScroller" class="overflow-hidden [scrollbar-gutter:stable]">
        <table class="table-fixed caption-bottom text-sm" :style="{ width: tableWidth }">
          <colgroup>
            <col v-for="(column, i) in visibleColumns" :key="column.id" :style="{ width: `${widths[i]}px` }">
          </colgroup>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent">
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :col-span="header.colSpan"
                :class="header.column.columnDef.meta?.className"
              >
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
              </TableHead>
            </TableRow>
          </TableHeader>
        </table>
      </div>
      <div ref="bodyScroller" class="overflow-auto [scrollbar-gutter:stable]" :style="{ maxHeight: bodyHeight }" @scroll="syncHeaderScroll">
        <table class="table-fixed caption-bottom text-sm" :style="{ width: tableWidth }">
          <colgroup>
            <col v-for="(column, i) in visibleColumns" :key="column.id" :style="{ width: `${widths[i]}px` }">
          </colgroup>
          <TableBody>
            <template v-if="isLoading">
              <TableRow v-for="i in skeletonRows" :key="i" class="hover:bg-transparent">
                <TableCell v-for="column in visibleColumns" :key="column.id">
                  <Skeleton class="h-5 w-full" />
                </TableCell>
              </TableRow>
            </template>
            <template v-else-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() ? 'selected' : undefined"
                :class="cn('group/row', props.onRowClick && 'cursor-pointer')"
                @click="onRowClick($event, row)"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" :class="cell.column.columnDef.meta?.className">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else class="hover:bg-transparent">
              <TableCell :colspan="visibleColumns.length" class="h-24 text-center text-muted-foreground">
                <slot name="empty">
                  {{ emptyState }}
                </slot>
              </TableCell>
            </TableRow>
          </TableBody>
        </table>
      </div>
    </div>

    <div
      v-else
      :class="layout === 'scroll' ? 'overflow-auto rounded-lg border' : 'overflow-hidden rounded-lg border'"
      :style="layout === 'scroll' ? { maxHeight: bodyHeight } : undefined"
    >
      <component
        :is="layout === 'scroll' ? 'table' : Table"
        :class="layout === 'scroll' ? 'w-full caption-bottom text-sm' : undefined"
      >
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :col-span="header.colSpan"
              :class="header.column.columnDef.meta?.className"
            >
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in skeletonRows" :key="i" class="hover:bg-transparent">
              <TableCell v-for="column in visibleColumns" :key="column.id">
                <Skeleton class="h-5 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="cn('group/row', props.onRowClick && 'cursor-pointer')"
              @click="onRowClick($event, row)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" :class="cell.column.columnDef.meta?.className">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else class="hover:bg-transparent">
            <TableCell :colspan="visibleColumns.length" class="h-24 text-center text-muted-foreground">
              <slot name="empty">
                {{ emptyState }}
              </slot>
            </TableCell>
          </TableRow>
        </TableBody>
      </component>
    </div>

    <DataTablePagination
      v-if="showPagination"
      :table="table"
      :page-size-options="pageSizeOptions"
      :show-selected-count="!!enableRowSelection"
    />
  </div>
</template>
