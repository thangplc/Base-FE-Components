<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, inject, onMounted } from 'vue'
import { cn } from '@/lib/utils'
import { TRUNCATE_TOOLTIP_KEY } from './truncate'

/**
 * Text that is cut with an ellipsis when it doesn't fit, with the full text
 * in a tooltip on hover (needs TruncateTooltipProvider at the root).
 * The parent must bound the width: e.g. a table cell, `w-48`, or `min-w-0`
 * inside a flex row.
 */
const props = withDefaults(defineProps<{
  /** 1 = single line with an ellipsis; 2–6 = cut after that many lines. */
  lines?: number
  /** Show the full text in a tooltip on hover when it is cut off. */
  tooltip?: boolean
  class?: HTMLAttributes['class']
}>(), {
  lines: 1,
  tooltip: true,
})

const lineClamp: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
}

const hasProvider = inject(TRUNCATE_TOOLTIP_KEY, false)

onMounted(() => {
  if (props.tooltip && !hasProvider && import.meta.env.DEV)
    console.warn('TruncatedText: wrap the app in <TruncateTooltipProvider> to get tooltips.')
})

const classes = computed(() => cn(
  'block min-w-0',
  props.lines > 1 ? `${lineClamp[props.lines] ?? 'line-clamp-6'} break-words whitespace-normal` : 'truncate',
  props.class,
))
</script>

<template>
  <span :data-truncate="tooltip ? '' : undefined" :class="classes">
    <slot />
  </span>
</template>
