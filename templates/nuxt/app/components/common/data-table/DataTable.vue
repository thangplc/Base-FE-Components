<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  FilterFn,
  GroupingState,
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
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed, ref, watch } from 'vue'
import { TableBody, TableHeader } from '@/components/ui/table'
import { cn, valueUpdater } from '@/lib/utils'
import DataTableBodyRows from './DataTableBodyRows.vue'
import DataTableHeaderRows from './DataTableHeaderRows.vue'
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
  /** Stable row id (e.g. `row => row.id`); needed for row selection across pages and `v-model:row-selection`. */
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
  /** 'checkbox' (default) or 'radio' (one row at a time). */
  selectionType?: 'checkbox' | 'radio'
  /** Header checkbox: the current page ('page', default) or every filtered row ('all'). */
  selectAllMode?: 'page' | 'all'
  /** When the table scrolls horizontally, keep the checkbox column fixed on the left. */
  selectionColumnPinned?: boolean

  // Grouping (v-model:grouping)
  defaultGrouping?: string[]
  /** "Group by" menu in the toolbar (columns with an accessor and `enableGrouping !== false`). */
  enableGrouping?: boolean
  /** Groups start expanded (default true). */
  defaultExpanded?: boolean
  /** Paginate over top-level groups instead of every visible row. */
  paginateGroups?: boolean
  /** Keep grouped columns as normal columns (default: hidden, their value is in the group row). */
  keepGroupedColumns?: boolean
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
  selectionType: 'checkbox',
  selectAllMode: 'page',
  selectionColumnPinned: true,
  bordered: false,
  enableGrouping: false,
  defaultExpanded: true,
  paginateGroups: false,
  keepGroupedColumns: false,
})

const emit = defineEmits<{
  /** Selected rows (those loaded) and the ids of every selected row, after each change. */
  'selection-change': [rows: TData[], ids: string[]]
}>()

const slots = defineSlots<{
  /** Controls on the right of the toolbar, e.g. an "Add" button. */
  'toolbar-actions'?: () => unknown
  /** Toolbar content while rows are selected (delete, export...). */
  'bulk-actions'?: (props: { rows: TData[], clear: () => void }) => unknown
  /** Shown when there are no rows. */
  'empty'?: () => unknown
  /** Label of a group row (default "Column: value"); the count is added after it. */
  'group-row'?: (props: { row: Row<TData> }) => unknown
}>()

// Each model is owned by the table unless the parent binds it with v-model.
const sorting = defineModel<SortingState>('sorting')
const columnFilters = defineModel<ColumnFiltersState>('columnFilters')
const search = defineModel<string>('search')
const pagination = defineModel<PaginationState>('pagination')
/** Selected row ids (from getRowId), kept across pages, also server-side. */
const rowSelectionIds = defineModel<string[]>('rowSelection')
const grouping = defineModel<GroupingState>('grouping')
sorting.value ??= props.defaultSorting ?? []
columnFilters.value ??= []
search.value ??= ''
pagination.value ??= { pageIndex: 0, pageSize: props.pageSize }
grouping.value ??= props.defaultGrouping ?? []

const columnVisibility = ref<VisibilityState>(props.defaultColumnVisibility ?? {})
const innerSelection = ref<RowSelectionState>({})
// A bound v-model:row-selection comes in as ids; TanStack wants { [id]: true }.
const rowSelection = computed<RowSelectionState>(() =>
  rowSelectionIds.value ? Object.fromEntries(rowSelectionIds.value.map(id => [id, true])) : innerSelection.value,
)
const expanded = ref<ExpandedState>(props.defaultExpanded ? true : {})

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
    ...(props.enableRowSelection
      ? [selectionColumn<TData>(props.selectionType, props.selectAllMode, props.selectionColumnPinned)]
      : []),
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
    get grouping() { return grouping.value },
    get expanded() { return expanded.value },
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
    const next = functionalUpdate(updater, rowSelection.value)
    // Group rows get selected along with their children; keep row ids only.
    const groupIds = new Set(table.getGroupedRowModel().flatRows.filter(r => r.getIsGrouped()).map(r => r.id))
    const ids = Object.keys(next).filter(id => next[id] && !groupIds.has(id))
    innerSelection.value = next
    if (rowSelectionIds.value)
      rowSelectionIds.value = ids
    const rowsById = table.getCoreRowModel().rowsById
    emit('selection-change', ids.map(id => rowsById[id]?.original).filter((row): row is TData => row !== undefined), ids)
  },
  onGroupingChange: (updater) => {
    grouping.value = functionalUpdate(updater, grouping.value!)
    firstPage()
  },
  onExpandedChange: updater => (expanded.value = functionalUpdate(updater, expanded.value)),
  get enableRowSelection() {
    const enable = props.enableRowSelection
    return typeof enable === 'function' ? (row: Row<TData>) => row.getIsGrouped() || enable(row.original) : enable
  },
  get enableMultiRowSelection() { return props.selectionType !== 'radio' },
  get groupedColumnMode() { return props.keepGroupedColumns ? false : 'remove' as const },
  get paginateExpandedRows() { return !props.paginateGroups },
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
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
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
// The element that scrolls horizontally (the body in the split layout).
const scroller = ref<HTMLDivElement>()
const available = ref(0)
// Whether the columns overflow horizontally; drives the pinned actions
// column through `data-overflow-x` (see pinnedRightClass in helpers.ts).
const overflowX = ref(false)

watch(scroller, (element, _, onCleanup) => {
  if (!element)
    return
  const update = () => {
    available.value = element.clientWidth
    overflowX.value = element.scrollWidth > element.clientWidth + 1
  }
  // The scroller resizes with the window; the table with its columns.
  const observer = new ResizeObserver(update)
  observer.observe(element)
  if (element.firstElementChild)
    observer.observe(element.firstElementChild)
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })
const widths = computed(() => columnWidths(visibleColumns.value, available.value))
const tableWidth = computed(() => `${widths.value.reduce((sum, w) => sum + w, 0)}px`)

const selectedIds = computed(() => Object.keys(rowSelection.value).filter(
  id => rowSelection.value[id] && !table.getRowModel().rowsById[id]?.getIsGrouped(),
))

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
  <div
    :class="cn(
      'group/table flex flex-col gap-4',
      // Vertical body borders; header cells get theirs in DataTableHeaderRows.
      bordered && '[&_td:not(:last-child)]:border-r',
      props.class,
    )"
    :data-overflow-x="overflowX || undefined"
  >
    <DataTableToolbar
      :table="table"
      :search-placeholder="searchPlaceholder"
      :search-debounce-ms="searchDebounceMs"
      :filters="filters"
      :enable-column-visibility="enableColumnVisibility"
      :has-bulk-actions="!!slots['bulk-actions']"
      :enable-grouping="enableGrouping"
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
            <DataTableHeaderRows :table="table" :bordered="bordered" />
          </TableHeader>
        </table>
      </div>
      <div ref="scroller" class="overflow-auto [scrollbar-gutter:stable]" :style="{ maxHeight: bodyHeight }" @scroll="syncHeaderScroll">
        <table class="table-fixed caption-bottom text-sm" :style="{ width: tableWidth }">
          <colgroup>
            <col v-for="(column, i) in visibleColumns" :key="column.id" :style="{ width: `${widths[i]}px` }">
          </colgroup>
          <TableBody>
            <DataTableBodyRows
              :table="table"
              :is-loading="isLoading"
              :skeleton-rows="skeletonRows"
              :clickable="!!props.onRowClick"
              :empty-state="emptyState"
              @row-click="onRowClick"
            >
              <template #empty>
                <slot name="empty">
                  {{ emptyState }}
                </slot>
              </template>
              <template v-if="slots['group-row']" #group-row="{ row }">
                <slot name="group-row" :row="row" />
              </template>
            </DataTableBodyRows>
          </TableBody>
        </table>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-lg border">
      <div
        ref="scroller"
        :class="layout === 'scroll' ? 'overflow-auto' : 'relative w-full overflow-x-auto'"
        :style="layout === 'scroll' ? { maxHeight: bodyHeight } : undefined"
      >
        <table data-slot="table" class="w-full caption-bottom text-sm">
          <TableHeader>
            <DataTableHeaderRows :table="table" :bordered="bordered" />
          </TableHeader>
          <TableBody>
            <DataTableBodyRows
              :table="table"
              :is-loading="isLoading"
              :skeleton-rows="skeletonRows"
              :clickable="!!props.onRowClick"
              :empty-state="emptyState"
              @row-click="onRowClick"
            >
              <template #empty>
                <slot name="empty">
                  {{ emptyState }}
                </slot>
              </template>
              <template v-if="slots['group-row']" #group-row="{ row }">
                <slot name="group-row" :row="row" />
              </template>
            </DataTableBodyRows>
          </TableBody>
        </table>
      </div>
    </div>

    <DataTablePagination
      v-if="showPagination"
      :table="table"
      :page-size-options="pageSizeOptions"
      :show-selected-count="!!enableRowSelection"
      :selected-count="selectedIds.length"
    />
  </div>
</template>
