<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import type { DateLike, DateValueFormat } from './date-value'
import { computed } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, pad, toCalendarDate } from './date-picker'
import DatePickerTrigger from './DatePickerTrigger.vue'
import { formatDateValue, parseDateValue } from './date-value'

/** Pick a day and a time (HH:mm); the popover stays open to adjust both. `v-model`: a Date, or the shape set by `valueFormat`. */
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
  /**
   * Shape of `v-model`: 'date' (default), 'iso', 'timestamp', a pattern
   * like 'yyyy-MM-dd', or a `{ format, parse }` codec.
   */
  valueFormat?: DateValueFormat
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Pick date & time',
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
  minuteStep: 1,
})

const model = defineModel<DateLike | undefined>()

// Work with a Date inside; emit the shape picked by `valueFormat`.
const date = computed({
  get: () => parseDateValue(model.value, props.valueFormat),
  set: value => (model.value = formatDateValue(value, props.valueFormat)),
})

const text = computed(() => date.value?.toLocaleString(props.locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}))
const time = computed(() => date.value ? `${pad(date.value.getHours())}:${pad(date.value.getMinutes())}` : '')

// Keep the time when the day changes, and the day when the time changes.
function selectDay(value: DateValue | undefined) {
  if (!value)
    return (date.value = undefined)
  const next = fromCalendarDate(value)
  next.setHours(date.value?.getHours() ?? 0, date.value?.getMinutes() ?? 0, 0, 0)
  date.value = next
}

function selectTime(hhmm: string | number) {
  const [hours, minutes] = String(hhmm).split(':').map(Number)
  if (hours === undefined || minutes === undefined || Number.isNaN(hours) || Number.isNaN(minutes))
    return
  const base = date.value ?? new Date()
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  next.setHours(hours, minutes, 0, 0)
  date.value = next
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
      @clear="date = undefined"
    />
    <PopoverContent align="start" class="w-auto p-0">
      <Calendar
        :model-value="toCalendarDate(date)"
        :default-placeholder="toCalendarDate(date ?? minDate)"
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
