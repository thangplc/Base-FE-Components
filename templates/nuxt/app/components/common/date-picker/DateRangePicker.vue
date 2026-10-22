<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateRange as CalendarRange } from 'reka-ui'
import type { WallRange } from './date-time'
import type { DateLike, DateRange } from './date-value'
import type { PickerBaseProps, PickerRangeProps } from './types'
import { computed, ref } from 'vue'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { fromCalendarDate, toCalendarDate, wallNow } from './calendar-date'
import {
  clampRange,
  createRangePresets,
  DEFAULT_LABELS,
  defaultPattern,
  formatDisplay,
  isDayDisabled,
  parseTypedRange,
  RANGE_SEPARATOR,
  startOfDay,
} from './date-time'
import { formatWallValue, parseWallValue, toWallTime } from './date-value'
import PickerTrigger from './PickerTrigger.vue'
import RangePresets from './RangePresets.vue'

/**
 * Pick a start and an end day; the popover stays open until you close it.
 * `v-model`: `{ from, to }`, each a Date or the shape set by `valueFormat`.
 */
const props = withDefaults(defineProps<PickerBaseProps & PickerRangeProps>(), {
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
  numberOfMonths: 2,
})

const model = defineModel<DateRange<DateLike> | undefined>()
const open = ref(false)
const month = ref<DateValue>()

// Everything inside works on wall-clock Dates in `timeZone`.
const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }))
const from = computed(() => parseWallValue(model.value?.from, props.valueFormat, props.timeZone))
const to = computed(() => parseWallValue(model.value?.to, props.valueFormat, props.timeZone))
const min = computed(() => toWallTime(props.minDate, props.timeZone))
const max = computed(() => toWallTime(props.maxDate, props.timeZone))
// Stable object: a new one on every render would reset Reka's half-picked range.
const calendarValue = computed(() => ({ start: toCalendarDate(from.value), end: toCalendarDate(to.value) }))
const rules = computed(() => ({ minDate: min.value, maxDate: max.value, disabledDates: props.disabledDates }))
const pattern = computed(() => props.displayFormat ?? defaultPattern(false))
const presetList = computed(() => props.presets === true ? createRangePresets() : props.presets || [])

function show(day: Date) {
  return formatDisplay(day, { displayFormat: props.editable ? pattern.value : props.displayFormat, locale: props.locale })
}
const text = computed(() => from.value || to.value
  ? `${from.value ? show(from.value) : '…'}${RANGE_SEPARATOR}${to.value ? show(to.value) : '…'}`
  : undefined)

function emitRange(range: WallRange | undefined) {
  const out = (day?: Date) => formatWallValue(day && startOfDay(day), props.valueFormat, props.timeZone)
  model.value = range?.from || range?.to ? { from: out(range.from), to: out(range.to) } : undefined
}

const editable = computed(() => props.editable
  ? {
      pattern: `${pattern.value}${RANGE_SEPARATOR}${pattern.value}`,
      onCommit: (typed: string) => {
        const range = parseTypedRange(typed, pattern.value, day => isDayDisabled(day, rules.value), props.maxDays)
        if (range)
          emitRange(range)
        return !!range
      },
    }
  : undefined)

function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    month.value = toCalendarDate(from.value ?? min.value ?? wallNow(props.timeZone))
}

// Reka already starts a new range on the click after a full one, and swaps an earlier end.
function select(range: CalendarRange) {
  emitRange({ from: range.start && fromCalendarDate(range.start), to: range.end && fromCalendarDate(range.end) })
}

function selectPreset(range: { from: Date, to: Date }) {
  emitRange(clampRange(range, rules.value))
  month.value = toCalendarDate(range.from)
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PickerTrigger
      :id="id"
      :text="text"
      :placeholder="placeholder ?? (editable ? editable.pattern.toLowerCase() : 'Pick a date range')"
      :disabled="disabled"
      :clearable="clearable"
      :invalid="invalid"
      :labels="labels"
      :editable="editable"
      :class="props.class"
      @clear="emitRange(undefined)"
    />
    <PopoverContent align="start" class="w-auto p-0">
      <div class="flex flex-col sm:flex-row">
        <RangePresets
          v-if="presetList.length"
          :presets="presetList"
          :time-zone="timeZone"
          :from="from"
          :to="to"
          @select="selectPreset"
        />
        <RangeCalendar
          :model-value="calendarValue"
          :placeholder="month"
          :min-value="toCalendarDate(min)"
          :max-value="toCalendarDate(max)"
          :is-date-disabled="(day: DateValue) => isDayDisabled(fromCalendarDate(day), rules)"
          :maximum-days="maxDays"
          :locale="locale"
          :number-of-months="numberOfMonths"
          initial-focus
          @update:placeholder="(day: DateValue) => (month = day)"
          @update:model-value="select"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>
