<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateRange as CalendarRange } from 'reka-ui'
import type { TimeBounds, WallRange } from './date-time'
import type { DateLike, DateRange } from './date-value'
import type { PickerBaseProps, PickerRangeProps, PickerTimeProps } from './types'
import { computed, ref } from 'vue'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { fromCalendarDate, toCalendarDate, wallNow } from './calendar-date'
import {
  atTime,
  clampRange,
  clampSeconds,
  createRangePresets,
  DEFAULT_LABELS,
  defaultPattern,
  formatDisplay,
  hasNoTime,
  isDayDisabled,
  isSameDay,
  parseTypedRange,
  RANGE_SEPARATOR,
  secondsOfDay,
  timeBoundsOn,
} from './date-time'
import { formatWallValue, parseWallValue, toWallTime } from './date-value'
import PickerFooter from './PickerFooter.vue'
import PickerTrigger from './PickerTrigger.vue'
import RangePresets from './RangePresets.vue'
import TimeColumns from './TimeColumns.vue'

/**
 * Pick a start and an end moment: the range calendar plus Start / End time
 * columns. Before a day is picked the columns preset its time; the end
 * can't be before the start on the same day.
 */
const props = withDefaults(defineProps<PickerBaseProps & PickerRangeProps & PickerTimeProps>(), {
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
  numberOfMonths: 1,
  minuteStep: 1,
  secondStep: 1,
  hourCycle: 24,
})

const model = defineModel<DateRange<DateLike> | undefined>()
const open = ref(false)
const month = ref<DateValue>()
// Times for a side whose day isn't picked yet (end defaults to the end of the day).
const endOfDay = computed(() => props.withSeconds ? 86399 : 86340)
const pending = ref({ from: 0, to: endOfDay.value })

// Everything inside works on wall-clock Dates in `timeZone`.
const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }))
const from = computed(() => parseWallValue(model.value?.from, props.valueFormat, props.timeZone))
const to = computed(() => parseWallValue(model.value?.to, props.valueFormat, props.timeZone))
const min = computed(() => toWallTime(props.minDate, props.timeZone))
const max = computed(() => toWallTime(props.maxDate, props.timeZone))
// Stable object: a new one on every render would reset Reka's half-picked range.
const calendarValue = computed(() => ({ start: toCalendarDate(from.value), end: toCalendarDate(to.value) }))
const dayRules = computed(() => ({ minDate: min.value, maxDate: max.value, disabledDates: props.disabledDates }))
const timeRules = computed(() => ({ minDate: min.value, maxDate: max.value, minTime: props.minTime, maxTime: props.maxTime }))
const timeOptions = computed(() => ({ withSeconds: props.withSeconds, hourCycle: props.hourCycle }))
const pattern = computed(() => props.displayFormat ?? defaultPattern(true, timeOptions.value))
const presetList = computed(() => props.presets === true ? createRangePresets() : props.presets || [])
const dayDisabled = (day: Date) => isDayDisabled(day, dayRules.value) || hasNoTime(day, timeRules.value)

const fromTime = computed(() => from.value ? secondsOfDay(from.value) : pending.value.from)
const toTime = computed(() => to.value ? secondsOfDay(to.value) : pending.value.to)
// On one day, the end can't be before the start (and vice versa).
const fromBounds = computed(() => {
  const bounds = timeBoundsOn(from.value, timeRules.value)
  return isSameDay(from.value, to.value) ? { ...bounds, max: Math.min(bounds.max, toTime.value) } : bounds
})
const toBounds = computed(() => {
  const bounds = timeBoundsOn(to.value, timeRules.value)
  return isSameDay(from.value, to.value) ? { ...bounds, min: Math.max(bounds.min, fromTime.value) } : bounds
})

function show(date: Date) {
  return formatDisplay(date, {
    displayFormat: props.editable ? pattern.value : props.displayFormat,
    locale: props.locale,
    withTime: true,
    ...timeOptions.value,
  })
}
const text = computed(() => from.value || to.value
  ? `${from.value ? show(from.value) : '…'}${RANGE_SEPARATOR}${to.value ? show(to.value) : '…'}`
  : undefined)

function at(day: Date, seconds: number, bounds?: TimeBounds) {
  return atTime(day, clampSeconds(seconds, bounds ?? timeBoundsOn(day, timeRules.value)))
}

function emitRange(range: WallRange | undefined) {
  let next = range
  if (next?.from && next.to && next.to < next.from)
    next = { ...next, to: next.from }
  const out = (date?: Date) => formatWallValue(date, props.valueFormat, props.timeZone)
  model.value = next?.from || next?.to ? { from: out(next.from), to: out(next.to) } : undefined
}

const editable = computed(() => props.editable
  ? {
      pattern: `${pattern.value}${RANGE_SEPARATOR}${pattern.value}`,
      onCommit: (typed: string) => {
        const range = parseTypedRange(typed, pattern.value, dayDisabled, props.maxDays)
        const fits = (date: Date) => {
          const bounds = timeBoundsOn(date, timeRules.value)
          return secondsOfDay(date) >= bounds.min && secondsOfDay(date) <= bounds.max
        }
        if (!range || !fits(range.from) || (range.to && !fits(range.to)))
          return false
        emitRange(range)
        return true
      },
    }
  : undefined)

function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    month.value = toCalendarDate(from.value ?? min.value ?? wallNow(props.timeZone))
}

// Each end keeps its side's time (moved into that day's window).
function selectDays(range: CalendarRange) {
  emitRange({
    from: range.start && at(fromCalendarDate(range.start), fromTime.value),
    to: range.end && at(fromCalendarDate(range.end), toTime.value),
  })
}

function selectFromTime(seconds: number) {
  if (from.value)
    emitRange({ from: atTime(from.value, seconds), to: to.value })
  else pending.value = { ...pending.value, from: seconds }
}

function selectToTime(seconds: number) {
  if (to.value)
    emitRange({ from: from.value, to: atTime(to.value, seconds) })
  else pending.value = { ...pending.value, to: seconds }
}

function selectPreset(range: { from: Date, to: Date }) {
  const days = clampRange(range, dayRules.value)
  emitRange({ from: at(days.from, 0), to: at(days.to, endOfDay.value) })
  month.value = toCalendarDate(range.from)
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PickerTrigger
      :id="id"
      :text="text"
      :placeholder="placeholder ?? (editable ? editable.pattern.toLowerCase() : 'Pick a date & time range')"
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
        <div class="flex">
          <RangeCalendar
            :model-value="calendarValue"
            :placeholder="month"
            :min-value="toCalendarDate(min)"
            :max-value="toCalendarDate(max)"
            :is-date-disabled="(day: DateValue) => dayDisabled(fromCalendarDate(day))"
            :maximum-days="maxDays"
            :locale="locale"
            :number-of-months="numberOfMonths"
            @update:placeholder="(day: DateValue) => (month = day)"
            @update:model-value="selectDays"
          />
          <TimeColumns
            :title="labels.start"
            :value="fromTime"
            :bounds="fromBounds"
            :minute-step="minuteStep"
            :second-step="secondStep"
            :with-seconds="withSeconds"
            :hour-cycle="hourCycle"
            @change="selectFromTime"
          />
          <TimeColumns
            :title="labels.end"
            :value="toTime"
            :bounds="toBounds"
            :minute-step="minuteStep"
            :second-step="secondStep"
            :with-seconds="withSeconds"
            :hour-cycle="hourCycle"
            @change="selectToTime"
          />
        </div>
      </div>
      <PickerFooter :labels="labels" :time-zone="timeZone" @done="open = false" />
    </PopoverContent>
  </Popover>
</template>
