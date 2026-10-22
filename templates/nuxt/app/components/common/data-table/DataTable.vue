<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ref } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { valueUpdater } from '@/lib/utils'
import DataTablePagination from './DataTablePagination.vue'
import DataTableToolbar from './DataTableToolbar.vue'

/**
 * Client-side table with global search, sorting, column visibility and
 * pagination. For server-side data, lift `sorting` / `pagination` state up
 * and pass `manualSorting` / `manualPagination` to `useVueTable`.
 */
const props = withDefaults(defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows a search box that filters across all columns. */
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
}>(), {
  pageSize: 10,
  emptyMessage: 'No results.',
})

defineSlots<{
  /** Extra controls rendered on the right of the toolbar (e.g. "Add" button). */
  'toolbar-actions'?: () => unknown
}>()

const sorting = ref<SortingState>([])
const columnVisibility = ref<VisibilityState>({})
const globalFilter = ref('')

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  state: {
    get sorting() { return sorting.value },
    get columnVisibility() { return columnVisibility.value },
    get globalFilter() { return globalFilter.value },
  },
  initialState: { pagination: { pageSize: props.pageSize } },
  onSortingChange: updater => valueUpdater(updater, sorting),
  onColumnVisibilityChange: updater => valueUpdater(updater, columnVisibility),
  onGlobalFilterChange: updater => valueUpdater(updater, globalFilter),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <DataTableToolbar :table="table" :search-placeholder="searchPlaceholder">
      <slot name="toolbar-actions" />
    </DataTableToolbar>
    <div class="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :col-span="header.colSpan"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="table.getVisibleLeafColumns().length"
              class="h-24 text-center text-muted-foreground"
            >
              {{ emptyMessage }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <DataTablePagination :table="table" />
  </div>
</template>
