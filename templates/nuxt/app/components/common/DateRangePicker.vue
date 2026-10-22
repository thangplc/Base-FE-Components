<script setup lang="ts">
import type { DateRange as CalendarRange } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { DateLike, DateRange, DateValueFormat } from './date-value'
import { computed } from 'vue'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { fromCalendarDate, toCalendarDate } from './date-picker'
import DatePickerTrigger from './DatePickerTrigger.vue'
import { formatDateValue, parseDateValue } from './date-value'

/**
 * Pick a start and an end day; the popover stays open until you close it.
 * `v-model`: `{ from, to }`, each a Date or the shape set by `valueFormat`.
 */
const props = withDefaults(defineProps<{
  placeholder?: string
  /** Earliest / latest selectable day. */
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  /** Locale for the displayed value (default "en-GB" → 22/10/2026). */
  locale?: string
  clearable?: boolean
  /**
   * Shape of `from` / `to`: 'date' (default), 'iso', 'timestamp', a pattern
   * like 'yyyy-MM-dd', or a `{ format, parse }` codec.
   */
  valueFormat?: DateValueFormat
  /** Months shown side by side (default 2; they stack on small screens). */
  numberOfMonths?: number
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Pick a date range',
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
  numberOfMonths: 2,
})

const model = defineModel<DateRange<DateLike> | undefined>()

const from = computed(() => parseDateValue(model.value?.from, props.valueFormat))
const to = computed(() => parseDateValue(model.value?.to, props.valueFormat))

const formatDay = (date: Date) =>
  date.toLocaleDateString(props.locale, { day: '2-digit', month: '2-digit', year: 'numeric' })

const text = computed(() => from.value || to.value
  ? `${from.value ? formatDay(from.value) : '…'} – ${to.value ? formatDay(to.value) : '…'}`
  : undefined)

// The first click sets `start` only; an end before the start swaps the two.
function select(range: CalendarRange) {
  model.value = range.start || range.end
    ? {
        from: formatDateValue(range.start && fromCalendarDate(range.start), props.valueFormat),
        to: formatDateValue(range.end && fromCalendarDate(range.end), props.valueFormat),
      }
    : undefined
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
      <RangeCalendar
        :model-value="{ start: toCalendarDate(from), end: toCalendarDate(to) }"
        :default-placeholder="toCalendarDate(from ?? minDate)"
        :min-value="toCalendarDate(minDate)"
        :max-value="toCalendarDate(maxDate)"
        :locale="locale"
        :number-of-months="numberOfMonths"
        initial-focus
        @update:model-value="select"
      />
    </PopoverContent>
  </Popover>
</template>
