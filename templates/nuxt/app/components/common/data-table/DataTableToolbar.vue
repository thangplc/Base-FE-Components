<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import type { DataTableFilter } from './types'
import { SearchIcon, Settings2Icon, XIcon } from '@lucide/vue'
import { watchDebounced } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import DataTableFilterControl from './DataTableFilter.vue'

const props = withDefaults(defineProps<{
  table: Table<TData>
  searchPlaceholder?: string
  searchDebounceMs?: number
  filters?: DataTableFilter[]
  enableColumnVisibility?: boolean
  /** Show the bulk-actions bar instead of the filters while rows are selected. */
  hasBulkActions?: boolean
}>(), {
  searchDebounceMs: 300,
  enableColumnVisibility: true,
})

defineSlots<{
  'default'?: () => unknown
  'bulk-actions'?: (props: { rows: TData[], clear: () => void }) => unknown
}>()

const selectedRows = computed(() => props.table.getSelectedRowModel().rows.map(row => row.original))
const isFiltered = computed(() =>
  props.table.getState().columnFilters.length > 0 || Boolean(props.table.getState().globalFilter),
)
const hideableColumns = computed(() =>
  props.table.getAllColumns().filter(column => column.getCanHide() && column.accessorFn !== undefined),
)

// Search box: local text, applied to the table after a debounce.
const applied = computed(() => (props.table.getState().globalFilter as string | undefined) ?? '')
const text = ref(applied.value)
// Follow external changes (Reset button, v-model:search).
watch(applied, (value) => {
  text.value = value
})
watchDebounced(text, (value) => {
  if (value !== applied.value)
    props.table.setGlobalFilter(value)
}, { debounce: () => props.searchDebounceMs })

function reset() {
  props.table.resetColumnFilters()
  props.table.setGlobalFilter('')
}

const clearSelection = () => props.table.resetRowSelection()
</script>

<template>
  <div
    v-if="hasBulkActions && selectedRows.length"
    class="flex min-h-8 flex-wrap items-center gap-2 rounded-lg bg-muted px-3 py-1.5"
  >
    <span class="text-sm font-medium">{{ selectedRows.length }} selected</span>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="bulk-actions" :rows="selectedRows" :clear="clearSelection" />
    </div>
    <Button variant="ghost" size="sm" class="ml-auto" @click="clearSelection">
      <XIcon data-icon="inline-start" />
      Clear selection
    </Button>
  </div>

  <div v-else class="flex flex-wrap items-center gap-2">
    <InputGroup v-if="searchPlaceholder" class="w-full sm:max-w-xs">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput v-model="text" :placeholder="searchPlaceholder" />
      <InputGroupAddon v-if="text" align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Clear search" @click="text = ''">
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
    <template v-for="filter in filters" :key="filter.columnId">
      <DataTableFilterControl
        v-if="table.getColumn(filter.columnId)"
        :column="table.getColumn(filter.columnId)!"
        :filter="filter"
      />
    </template>
    <Button v-if="isFiltered" variant="ghost" @click="reset">
      Reset
      <XIcon data-icon="inline-end" />
    </Button>
    <div class="ml-auto flex items-center gap-2">
      <DropdownMenu v-if="enableColumnVisibility && hideableColumns.length">
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            <Settings2Icon data-icon="inline-start" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-44">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            v-for="column in hideableColumns"
            :key="column.id"
            :model-value="column.getIsVisible()"
            @update:model-value="(value: boolean | 'indeterminate') => column.toggleVisibility(value === true)"
            @select="(event: Event) => event.preventDefault()"
          >
            {{ column.columnDef.meta?.label ?? (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id) }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <slot />
    </div>
  </div>
</template>
