<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { computed } from 'vue'
import { TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { headerLayout } from './helpers'

/** Header rows, with group headers (colSpan) and columns spanning empty rows (rowSpan). */
const props = defineProps<{ table: Table<TData>, bordered?: boolean }>()

const rows = computed(() => headerLayout(props.table))
</script>

<template>
  <TableRow v-for="(cells, depth) in rows" :key="depth" class="hover:bg-transparent">
    <TableHead
      v-for="cell in cells"
      :key="cell.key"
      :colspan="cell.colSpan"
      :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
      :class="cn(
        cell.header.column.columnDef.meta?.className,
        cell.isGroup && 'text-center',
        rows.length > 1 && 'border-b',
        bordered && !cell.atRightEdge && 'border-r',
      )"
    >
      <FlexRender v-if="!cell.header.isPlaceholder" :render="cell.header.column.columnDef.header" :props="cell.header.getContext()" />
    </TableHead>
  </TableRow>
</template>
