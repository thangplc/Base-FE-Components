<script setup lang="ts" generic="TData">
import type { Cell, Row, Table } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import TruncatedText from '@/components/common/TruncatedText.vue'
import { cn } from '@/lib/utils'
import DataTableGroupLabel from './DataTableGroupLabel.vue'
import { mergedRowSpans } from './helpers'

/** Body rows: skeleton, data / group rows (with merged cells), or the empty state. Slots: #empty, #group-row="{ row }". */
const props = defineProps<{
  table: Table<TData>
  isLoading?: boolean
  skeletonRows: number
  clickable?: boolean
  emptyState?: string
}>()

const emit = defineEmits<{ 'row-click': [event: MouseEvent, row: Row<TData>] }>()

const rows = computed(() => props.table.getRowModel().rows)
const visibleColumns = computed(() => props.table.getVisibleLeafColumns())
const grouped = computed(() => props.table.getState().grouping.length > 0)
const spans = computed(() => grouped.value ? undefined : mergedRowSpans(rows.value, visibleColumns.value))
// The first data column carries the group label / indent while grouping.
const labelColumnId = computed(() => visibleColumns.value.find(column => column.id !== 'select')?.id)

/**
 * Body cell content per `meta.overflow`. 'truncate' cuts long text with an
 * ellipsis via TruncatedText, full text in the app-wide tooltip (needs a
 * bounded width: always true with `maxBodyHeight`; in the auto layout
 * columns grow to fit, unless you cap them, e.g. `max-w-60` in `meta.className`).
 */
function overflowOf(cell: Cell<TData, unknown>) {
  return cell.column.columnDef.meta?.overflow ?? 'truncate'
}

function cellKind(row: Row<TData>, cell: Cell<TData, unknown>) {
  if (!row.getIsGrouped() || cell.column.id === 'select')
    return 'value'
  if (cell.column.id === labelColumnId.value)
    return 'label'
  return cell.getIsAggregated() ? 'aggregated' : 'empty'
}
</script>

<template>
  <template v-if="isLoading">
    <TableRow v-for="i in skeletonRows" :key="i" class="hover:bg-transparent">
      <TableCell v-for="column in visibleColumns" :key="column.id">
        <Skeleton class="h-5 w-full" />
      </TableCell>
    </TableRow>
  </template>
  <template v-else-if="rows.length">
    <TableRow
      v-for="row in rows"
      :key="row.id"
      :data-state="row.getIsSelected() ? 'selected' : undefined"
      :data-group="row.getIsGrouped() || undefined"
      :class="cn('group/row', row.getIsGrouped() && 'bg-muted/40 font-medium', clickable && !row.getIsGrouped() && 'cursor-pointer')"
      @click="!row.getIsGrouped() && emit('row-click', $event, row)"
    >
      <template v-for="cell in row.getVisibleCells()" :key="cell.id">
        <TableCell
          v-if="spans?.get(`${row.id}:${cell.column.id}`) !== 0"
          :rowspan="(spans?.get(`${row.id}:${cell.column.id}`) ?? 1) > 1 ? spans?.get(`${row.id}:${cell.column.id}`) : undefined"
          :class="cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.mergeRows && 'border-r align-middle')"
          :style="grouped && cell.column.id === labelColumnId && !row.getIsGrouped() ? { paddingLeft: `${0.5 + row.depth * 1.5 + 1.75}rem` } : undefined"
        >
          <DataTableGroupLabel v-if="cellKind(row, cell) === 'label'" :row="row" :table="table">
            <slot name="group-row" :row="row" />
          </DataTableGroupLabel>
          <template v-else-if="cellKind(row, cell) === 'empty'" />
          <template v-else>
            <FlexRender
              v-if="overflowOf(cell) === 'visible'"
              :render="cellKind(row, cell) === 'aggregated' ? (cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell) : cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
            <TruncatedText v-else-if="overflowOf(cell) === 'truncate'">
              <FlexRender
                :render="cellKind(row, cell) === 'aggregated' ? (cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell) : cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TruncatedText>
            <div v-else class="break-words whitespace-normal">
              <FlexRender
                :render="cellKind(row, cell) === 'aggregated' ? (cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell) : cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </div>
          </template>
        </TableCell>
      </template>
    </TableRow>
  </template>
  <TableRow v-else class="hover:bg-transparent">
    <TableCell :colspan="visibleColumns.length" class="h-24 text-center text-muted-foreground">
      <slot name="empty">
        {{ emptyState }}
      </slot>
    </TableCell>
  </TableRow>
</template>
