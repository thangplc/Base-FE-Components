<script setup lang="ts" generic="TData">
import type { Row, Table } from '@tanstack/vue-table'
import { MinusIcon, PlusIcon } from '@lucide/vue'
import { computed } from 'vue'

/** Group row label: +/− toggle (indented by depth), "Column: value" and the row count. Slot: custom label. */
const props = defineProps<{ row: Row<TData>, table: Table<TData> }>()

const label = computed(() => {
  const column = props.row.groupingColumnId ? props.table.getColumn(props.row.groupingColumnId) : undefined
  const header = column?.columnDef.meta?.label ?? (typeof column?.columnDef.header === 'string' ? column.columnDef.header : column?.id)
  return `${header}: ${String(props.row.groupingValue ?? '—')}`
})
const count = computed(() => props.row.getLeafRows().filter(leaf => !leaf.getIsGrouped()).length)
</script>

<template>
  <div class="flex items-center gap-2" :style="{ paddingLeft: `${row.depth * 1.5}rem` }">
    <button
      type="button"
      :aria-label="row.getIsExpanded() ? 'Collapse group' : 'Expand group'"
      :aria-expanded="row.getIsExpanded()"
      class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      @click="row.toggleExpanded()"
    >
      <MinusIcon v-if="row.getIsExpanded()" class="size-3" />
      <PlusIcon v-else class="size-3" />
    </button>
    <span class="truncate"><slot>{{ label }}</slot></span>
    <span class="text-xs font-normal text-muted-foreground tabular-nums">({{ count }})</span>
  </div>
</template>
