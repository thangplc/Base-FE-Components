<script setup lang="ts" generic="TData, TValue">
import type { Column } from '@tanstack/vue-table'
import type { HTMLAttributes } from 'vue'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Sortable header: click cycles asc → desc → none. */
const props = defineProps<{
  column: Column<TData, TValue>
  title: string
  class?: HTMLAttributes['class']
}>()

const sorted = computed(() => props.column.getIsSorted())
const icon = computed(() =>
  sorted.value === 'asc' ? ArrowUpIcon : sorted.value === 'desc' ? ArrowDownIcon : ArrowUpDownIcon,
)
</script>

<template>
  <Button
    v-if="column.getCanSort()"
    variant="ghost"
    size="sm"
    :class="cn('-ml-2.5', props.class)"
    @click="column.getToggleSortingHandler()?.($event)"
  >
    {{ title }}
    <component
      :is="icon"
      data-icon="inline-end"
      :class="cn(!sorted && 'text-muted-foreground')"
    />
  </Button>
  <div v-else :class="props.class">
    {{ title }}
  </div>
</template>
