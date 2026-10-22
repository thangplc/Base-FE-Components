<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { HourCycle, TimeBounds } from './date-time'
import type { TimeColumnItem } from './TimeColumn.vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { clampSeconds, FULL_DAY } from './date-time'
import TimeColumn from './TimeColumn.vue'

/** Scrollable hour / minute (/ second / AM-PM) columns, as tall as their container. */
const props = withDefaults(defineProps<{
  /** Picked time in seconds since midnight; undefined = nothing picked yet. */
  value?: number
  /** Allowed window (other options are disabled). */
  bounds?: TimeBounds
  minuteStep?: number
  secondStep?: number
  withSeconds?: boolean
  hourCycle?: HourCycle
  /** Small heading on top, e.g. "Start". */
  title?: string
  class?: HTMLAttributes['class']
}>(), {
  bounds: () => FULL_DAY,
  minuteStep: 1,
  secondStep: 1,
  withSeconds: false,
  hourCycle: 24,
})

const emit = defineEmits<{ change: [seconds: number] }>()

const pad = (n: number) => String(n).padStart(2, '0')
const steps = (count: number, step: number) => Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step)

const columns = computed(() => {
  const { bounds, hourCycle, withSeconds } = props
  // Unpicked parts start from the earliest allowed time.
  const base = props.value ?? bounds.min
  const hour = Math.floor(base / 3600)
  const minute = Math.floor(base / 60) % 60
  const second = withSeconds ? base % 60 : 0
  const pm = hour >= 12
  const picked = props.value !== undefined
  // `seconds` is what a click picks (then clamped); the option is usable if any of [from, to] is allowed.
  const item = (key: string | number, label: string, seconds: number, [from, to]: [number, number], selected: boolean): TimeColumnItem => ({
    key,
    label,
    seconds,
    selected: picked && selected,
    disabled: to < bounds.min || from > bounds.max,
  })

  const hourValues = hourCycle === 12 ? [12, ...steps(11, 1).map(h => h + 1)] : steps(24, 1)
  const list: { label: string, items: TimeColumnItem[] }[] = [
    {
      label: 'Hours',
      items: hourValues.map((h) => {
        const h24 = hourCycle === 12 ? (h % 12) + (pm ? 12 : 0) : h
        return item(h, pad(h), h24 * 3600 + minute * 60 + second, [h24 * 3600, h24 * 3600 + 3599], h24 === hour)
      }),
    },
    {
      label: 'Minutes',
      items: steps(60, props.minuteStep).map((m) => {
        const start = hour * 3600 + m * 60
        return item(m, pad(m), start + second, [start, start + 59], m === minute)
      }),
    },
  ]
  if (withSeconds) {
    list.push({
      label: 'Seconds',
      items: steps(60, props.secondStep).map((s) => {
        const time = hour * 3600 + minute * 60 + s
        return item(s, pad(s), time, [time, time], s === second)
      }),
    })
  }
  if (hourCycle === 12) {
    const inDay = base % 43200
    list.push({
      label: 'AM/PM',
      items: [
        item('am', 'AM', inDay, [0, 43199], !pm),
        item('pm', 'PM', 43200 + inDay, [43200, 86399], pm),
      ],
    })
  }
  return list
})
</script>

<template>
  <div data-slot="time-columns" :class="cn('flex flex-col border-l', props.class)">
    <div v-if="title" class="border-b px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
      {{ title }}
    </div>
    <div class="relative min-h-48 flex-1" :style="{ width: `${columns.length * 3}rem` }">
      <div class="absolute inset-0 flex divide-x">
        <TimeColumn
          v-for="column in columns"
          :key="column.label"
          :label="column.label"
          :items="column.items"
          @select="seconds => emit('change', clampSeconds(seconds, bounds))"
        />
      </div>
    </div>
  </div>
</template>
