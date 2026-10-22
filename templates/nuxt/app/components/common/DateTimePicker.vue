<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, pad, toCalendarDate } from './date-picker'
import DatePickerTrigger from './DatePickerTrigger.vue'

/** Pick a day and a time (HH:mm); the popover stays open to adjust both. `v-model`: Date | undefined. */
const props = withDefaults(defineProps<{
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  /** Locale for the displayed value (default "en-GB" → 22/10/2026, 14:30). */
  locale?: string
  clearable?: boolean
  /** Minutes between selectable times in the time field (default 1). */
  minuteStep?: number
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Pick date & time',
  locale: 'en-GB',
  clearable: true,
  minuteStep: 1,
})

const model = defineModel<Date | undefined>()

const text = computed(() => model.value?.toLocaleString(props.locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}))
const time = computed(() => model.value ? `${pad(model.value.getHours())}:${pad(model.value.getMinutes())}` : '')

// Keep the time when the day changes, and the day when the time changes.
function selectDay(value: DateValue | undefined) {
  if (!value)
    return (model.value = undefined)
  const next = fromCalendarDate(value)
  next.setHours(model.value?.getHours() ?? 0, model.value?.getMinutes() ?? 0, 0, 0)
  model.value = next
}

function selectTime(hhmm: string | number) {
  const [hours, minutes] = String(hhmm).split(':').map(Number)
  if (hours === undefined || minutes === undefined || Number.isNaN(hours) || Number.isNaN(minutes))
    return
  const base = model.value ?? new Date()
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  next.setHours(hours, minutes, 0, 0)
  model.value = next
}
</script>

<template>
  <Popover>
    <DatePickerTrigger
      :id="id"
      :text="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :invalid="invalid"
      :class="props.class"
      @clear="model = undefined"
    />
    <PopoverContent align="start" class="w-auto p-0">
      <Calendar
        :model-value="toCalendarDate(model)"
        :default-placeholder="toCalendarDate(model ?? minDate)"
        :min-value="toCalendarDate(minDate)"
        :max-value="toCalendarDate(maxDate)"
        :locale="locale"
        layout="month-and-year"
        @update:model-value="(value) => selectDay(value as DateValue | undefined)"
      />
      <div class="flex items-center gap-2 border-t p-3">
        <Label :for="id ? `${id}-time` : undefined" class="text-muted-foreground">
          Time
        </Label>
        <Input
          :id="id ? `${id}-time` : undefined"
          type="time"
          :step="minuteStep * 60"
          :model-value="time"
          class="ml-auto w-28"
          @update:model-value="selectTime"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>
