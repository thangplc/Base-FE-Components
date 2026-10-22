<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ProgressVariants } from '@/components/ui/progress'
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import ProgressCircle from './ProgressCircle.vue'

/** Progress with a label, the value ("42%") and an optional description. */
const props = withDefaults(defineProps<{
  value?: number | null
  max?: number
  label?: string
  /** Small text under the bar, e.g. "3 of 12 files". */
  description?: string
  /** Show the value on the right of the label (default: true unless indeterminate). */
  showValue?: boolean
  /** Text for the value; default "42%". */
  formatValue?: (value: number, max: number) => string
  size?: ProgressVariants['size']
  variant?: ProgressVariants['variant']
  indeterminate?: boolean
  /** 'line' (default) or 'circle' (ProgressCircle with the label underneath). */
  type?: 'line' | 'circle'
  /** Circle only: degrees left open at the bottom (gauge). */
  gapDegree?: number
  class?: HTMLAttributes['class']
}>(), {
  type: 'line',
  value: 0,
  max: 100,
  showValue: undefined,
  indeterminate: false,
  formatValue: (value: number, max: number) => `${Math.round((value / max) * 100)}%`,
})

const current = computed(() => Math.min(props.max, Math.max(0, props.value ?? 0)))
const valueShown = computed(() => props.showValue ?? !props.indeterminate)
</script>

<template>
  <div v-if="type === 'circle'" data-slot="progress-bar" :class="cn('inline-flex flex-col items-center gap-1.5 text-center', props.class)">
    <ProgressCircle
      :value="current"
      :max="max"
      :size="size ?? 'default'"
      :variant="variant ?? 'default'"
      :indeterminate="indeterminate"
      :gap-degree="gapDegree"
      :show-value="showValue"
      :format-value="formatValue"
      :aria-label="label"
    />
    <span v-if="label" class="text-sm font-medium">{{ label }}</span>
    <p v-if="description" class="text-xs text-muted-foreground">
      {{ description }}
    </p>
  </div>
  <div v-else data-slot="progress-bar" :class="cn('flex w-full flex-col gap-1.5', props.class)">
    <div v-if="label || valueShown" class="flex items-center justify-between gap-4 text-sm">
      <span class="font-medium">{{ label }}</span>
      <span v-if="valueShown" class="text-muted-foreground tabular-nums">{{ formatValue(current, max) }}</span>
    </div>
    <Progress
      :model-value="current"
      :max="max"
      :size="size"
      :variant="variant"
      :indeterminate="indeterminate"
      :aria-label="label"
    />
    <p v-if="description" class="text-xs text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
