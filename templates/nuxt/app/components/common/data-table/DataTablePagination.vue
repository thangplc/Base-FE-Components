<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = withDefaults(defineProps<{
  table: Table<TData>
  pageSizeOptions?: number[]
}>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
})

const pagination = computed(() => props.table.getState().pagination)
const total = computed(() => props.table.getFilteredRowModel().rows.length)
// Keep a custom initial pageSize (e.g. 5) selectable.
const sizes = computed(() =>
  [...new Set([...props.pageSizeOptions, pagination.value.pageSize])].sort((a, b) => a - b),
)
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 text-sm">
    <p class="text-muted-foreground">
      {{ total }} row{{ total === 1 ? '' : 's' }}
    </p>
    <div class="flex flex-wrap items-center gap-4 lg:gap-6">
      <div class="flex items-center gap-2">
        <span class="font-medium">Rows per page</span>
        <Select
          :model-value="String(pagination.pageSize)"
          @update:model-value="(value) => table.setPageSize(Number(value))"
        >
          <SelectTrigger size="sm" class="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="size in sizes" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span class="font-medium">
        Page {{ pagination.pageIndex + 1 }} of {{ Math.max(table.getPageCount(), 1) }}
      </span>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          class="hidden lg:inline-flex"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <span class="sr-only">First page</span>
          <ChevronsLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <span class="sr-only">Previous page</span>
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <span class="sr-only">Next page</span>
          <ChevronRightIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          class="hidden lg:inline-flex"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <span class="sr-only">Last page</span>
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  </div>
</template>
