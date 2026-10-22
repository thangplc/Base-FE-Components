<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateLike } from './date-value'
import type { PickerBaseProps } from './types'
import { computed, ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, toCalendarDate, wallNow } from './calendar-date'
import { DEFAULT_LABELS, defaultPattern, formatDisplay, isDayDisabled, startOfDay } from './date-time'
import { formatWallValue, parseDatePattern, parseWallValue, toWallTime } from './date-value'
import PickerTrigger from './PickerTrigger.vue'

/** Pick a day from a calendar in a popover (Reka calendar). `v-model`: a Date, or the shape set by `valueFormat`. */
const props = withDefaults(defineProps<PickerBaseProps>(), {
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
})

const model = defineModel<DateLike | undefined>()
const open = ref(false)
const month = ref<DateValue>()

// Everything inside works on wall-clock Dates in `timeZone`.
const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }))
const value = computed(() => parseWallValue(model.value, props.valueFormat, props.timeZone))
const min = computed(() => toWallTime(props.minDate, props.timeZone))
const max = computed(() => toWallTime(props.maxDate, props.timeZone))
const calendarValue = computed(() => toCalendarDate(value.value))
const rules = computed(() => ({ minDate: min.value, maxDate: max.value, disabledDates: props.disabledDates }))
const pattern = computed(() => props.displayFormat ?? defaultPattern(false))

const text = computed(() => value.value
  && formatDisplay(value.value, { displayFormat: props.editable ? pattern.value : props.displayFormat, locale: props.locale }))

function emitDay(day: Date | undefined) {
  model.value = formatWallValue(day && startOfDay(day), props.valueFormat, props.timeZone)
}

const editable = computed(() => props.editable
  ? {
      pattern: pattern.value,
      onCommit: (typed: string) => {
        const day = parseDatePattern(typed, pattern.value)
        if (!day || isDayDisabled(day, rules.value))
          return false
        emitDay(day)
        return true
      },
    }
  : undefined)

function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    month.value = toCalendarDate(value.value ?? min.value ?? wallNow(props.timeZone))
}

function select(day: DateValue | undefined) {
  if (!day)
    return
  emitDay(fromCalendarDate(day))
  open.value = false
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PickerTrigger
      :id="id"
      :text="text"
      :placeholder="placeholder ?? (editable ? pattern.toLowerCase() : 'Pick a date')"
      :disabled="disabled"
      :clearable="clearable"
      :invalid="invalid"
      :labels="labels"
      :editable="editable"
      :class="props.class"
      @clear="emitDay(undefined)"
    />
    <PopoverContent align="start" class="w-auto p-0">
      <Calendar
        :model-value="calendarValue"
        :placeholder="month"
        :min-value="toCalendarDate(min)"
        :max-value="toCalendarDate(max)"
        :is-date-disabled="(day: DateValue) => isDayDisabled(fromCalendarDate(day), rules)"
        :locale="locale"
        layout="month-and-year"
        prevent-deselect
        initial-focus
        @update:placeholder="(day: DateValue) => (month = day)"
        @update:model-value="(day) => select(day as DateValue | undefined)"
      />
    </PopoverContent>
  </Popover>
</template>
