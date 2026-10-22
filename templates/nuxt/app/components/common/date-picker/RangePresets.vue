<script setup lang="ts">
import type { DateRangePreset } from './date-time'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { wallNow } from './calendar-date'
import { isSameDay, startOfDay } from './date-time'

/** Preset shortcuts on the left of a range calendar; the active one is highlighted. */
const props = defineProps<{
  presets: DateRangePreset[]
  timeZone?: string
  from?: Date
  to?: Date
}>()

const emit = defineEmits<{ select: [range: { from: Date, to: Date }] }>()

const items = computed(() => {
  const today = startOfDay(wallNow(props.timeZone))
  return props.presets.map((preset) => {
    const range = preset.range(today)
    return { label: preset.label, range, active: isSameDay(range.from, props.from) && isSameDay(range.to, props.to) }
  })
})
</script>

<template>
  <div
    data-slot="range-presets"
    class="flex flex-wrap gap-1 border-b p-2 sm:w-36 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0"
  >
    <Button
      v-for="item in items"
      :key="item.label"
      type="button"
      :variant="item.active ? 'secondary' : 'ghost'"
      size="sm"
      class="justify-start font-normal"
      @click="emit('select', item.range)"
    >
      {{ item.label }}
    </Button>
  </div>
</template>
