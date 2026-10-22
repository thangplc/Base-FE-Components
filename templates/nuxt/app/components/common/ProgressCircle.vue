<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const SIZES = { sm: 40, default: 64, lg: 96 } as const
const STROKES = { sm: 4, default: 6, lg: 8 } as const

const strokeClass = {
  default: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  destructive: 'stroke-destructive',
}

/** Circular progress (SVG ring), optionally a gauge with a gap at the bottom. Slot: custom middle content. */
const props = withDefaults(defineProps<{
  /** 0–`max` (default 100). */
  value?: number | null
  max?: number
  variant?: keyof typeof strokeClass
  /** Unknown progress: a spinning arc. */
  indeterminate?: boolean
  /** sm 40px / default 64px / lg 96px, or a number of px. */
  size?: keyof typeof SIZES | number
  /** Ring thickness in px (default 4 / 6 / 8 by size). */
  strokeWidth?: number
  lineCap?: 'round' | 'butt'
  /** Degrees left open at the bottom, e.g. 75 for a "dashboard" gauge. */
  gapDegree?: number
  /** Show the value in the middle (default: true unless indeterminate). */
  showValue?: boolean
  /** Text for the value; default "42%". */
  formatValue?: (value: number, max: number) => string
  ariaLabel?: string
  class?: HTMLAttributes['class']
}>(), {
  value: 0,
  max: 100,
  variant: 'default',
  indeterminate: false,
  size: 'default',
  lineCap: 'round',
  gapDegree: 0,
  showValue: undefined,
  formatValue: (value: number, max: number) => `${Math.round((value / max) * 100)}%`,
})

const ring = computed(() => {
  const px = typeof props.size === 'number' ? props.size : SIZES[props.size]
  const stroke = props.strokeWidth ?? (typeof props.size === 'number' ? Math.max(3, Math.round(props.size / 11)) : STROKES[props.size])
  const current = Math.min(props.max, Math.max(0, props.value ?? 0))
  const radius = (px - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // The visible arc: the whole circle minus the gap.
  const arc = circumference * (1 - Math.min(Math.max(props.gapDegree, 0), 359) / 360)
  const filled = props.indeterminate ? arc * 0.25 : arc * (current / props.max)
  // Start at the top, or just after the gap (which is centered at the bottom).
  const rotation = props.gapDegree > 0 ? 90 + props.gapDegree / 2 : -90
  return { px, stroke, current, radius, circumference, arc, filled, rotation, center: px / 2 }
})
const valueShown = computed(() => props.showValue ?? !props.indeterminate)
</script>

<template>
  <div
    data-slot="progress-circle"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="indeterminate ? undefined : ring.current"
    :class="cn('relative inline-flex shrink-0 items-center justify-center', props.class)"
    :style="{ width: `${ring.px}px`, height: `${ring.px}px` }"
  >
    <svg
      :width="ring.px"
      :height="ring.px"
      :viewBox="`0 0 ${ring.px} ${ring.px}`"
      :class="cn(indeterminate && 'animate-spin [animation-duration:1.2s]')"
      aria-hidden="true"
    >
      <g :transform="`rotate(${ring.rotation} ${ring.center} ${ring.center})`" fill="none" :stroke-width="ring.stroke" :stroke-linecap="lineCap">
        <circle :cx="ring.center" :cy="ring.center" :r="ring.radius" class="stroke-muted" :stroke-dasharray="`${ring.arc} ${ring.circumference}`" />
        <circle
          :cx="ring.center"
          :cy="ring.center"
          :r="ring.radius"
          :class="cn(strokeClass[variant], 'transition-[stroke-dasharray] duration-300')"
          :stroke-dasharray="`${ring.filled} ${ring.circumference}`"
          :opacity="ring.filled === 0 ? 0 : 1"
        />
      </g>
    </svg>
    <span
      v-if="$slots.default || valueShown"
      :class="cn('absolute inset-0 flex items-center justify-center font-medium tabular-nums', ring.px < 56 ? 'text-[0.65rem]' : ring.px < 88 ? 'text-sm' : 'text-lg')"
    >
      <slot>{{ formatValue(ring.current, max) }}</slot>
    </span>
  </div>
</template>
