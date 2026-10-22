<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import { computed, ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, toCalendarDate } from './date-picker'
import DatePickerTrigger from './DatePickerTrigger.vue'

/** Pick a day from a calendar in a popover (Reka calendar). `v-model`: Date | undefined. */
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
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Pick a date',
  locale: 'en-GB',
  clearable: true,
})

const model = defineModel<Date | undefined>()
const open = ref(false)

const text = computed(() =>
  model.value?.toLocaleDateString(props.locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
)

function select(value: DateValue | undefined) {
  model.value = value ? fromCalendarDate(value) : undefined
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
        initial-focus
        @update:model-value="(value) => select(value as DateValue | undefined)"
      />
    </PopoverContent>
  </Popover>
</template>
