<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import { SearchIcon, Settings2Icon } from '@lucide/vue'
import { computed } from 'vue'
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
  InputGroupInput,
} from '@/components/ui/input-group'

const props = defineProps<{
  table: Table<TData>
  searchPlaceholder?: string
}>()

const hideableColumns = computed(() =>
  props.table
    .getAllColumns()
    .filter(column => column.getCanHide() && column.accessorFn !== undefined),
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <InputGroup v-if="searchPlaceholder" class="w-full sm:max-w-xs">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        :placeholder="searchPlaceholder"
        :model-value="(table.getState().globalFilter as string) ?? ''"
        @update:model-value="(value: string | number) => table.setGlobalFilter(String(value))"
      />
    </InputGroup>
    <div class="ml-auto flex items-center gap-2">
      <DropdownMenu v-if="hideableColumns.length">
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
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="(value) => column.toggleVisibility(!!value)"
          >
            {{ typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <slot />
    </div>
  </div>
</template>
