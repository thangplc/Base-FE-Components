<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import type { DateLike, DateValueFormat } from './date-value'
import { computed, ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, toCalendarDate } from './date-picker'
import DatePickerTrigger from './DatePickerTrigger.vue'
import { formatDateValue, parseDateValue } from './date-value'

/** Pick a day from a calendar in a popover (Reka calendar). `v-model`: a Date, or the shape set by `valueFormat`. */
const props = withDefaults(defineProps<{
  placeholder?: string
  /** Earliest / latest selectable day. */
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  /** Locale for the displayed value, e.g. "vi-VN" (default "en-GB" → 22/10/2026). */
  locale?: string
  /** Show an × to clear the value. */
  clearable?: boolean
  /**
   * Shape of `v-model`: 'date' (default), 'iso', 'timestamp', a pattern
   * like 'yyyy-MM-dd', or a `{ format, parse }` codec.
   */
  valueFormat?: DateValueFormat
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Pick a date',
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
})

const model = defineModel<DateLike | undefined>()

// Work with a Date inside; emit the shape picked by `valueFormat`.
const date = computed({
  get: () => parseDateValue(model.value, props.valueFormat),
  set: value => (model.value = formatDateValue(value, props.valueFormat)),
})
const open = ref(false)

const text = computed(() =>
  date.value?.toLocaleDateString(props.locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
)

function select(value: DateValue | undefined) {
  date.value = value ? fromCalendarDate(value) : undefined
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
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
        initial-focus
        @update:model-value="(value) => select(value as DateValue | undefined)"
      />
    </PopoverContent>
  </Popover>
</template>
