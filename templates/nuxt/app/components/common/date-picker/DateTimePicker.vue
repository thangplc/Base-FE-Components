<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateLike } from './date-value'
import type { PickerBaseProps, PickerTimeProps } from './types'
import { computed, ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { fromCalendarDate, toCalendarDate, wallNow } from './calendar-date'
import {
  atTime,
  clampSeconds,
  DEFAULT_LABELS,
  defaultPattern,
  firstEnabledDay,
  formatDisplay,
  hasNoTime,
  isDayDisabled,
  secondsOfDay,
  timeBoundsOn,
} from './date-time'
import { formatWallValue, parseDatePattern, parseWallValue, toWallTime } from './date-value'
import PickerFooter from './PickerFooter.vue'
import PickerTrigger from './PickerTrigger.vue'
import TimeColumns from './TimeColumns.vue'

/**
 * Pick a day and a time (hour / minute columns); the popover stays open to
 * adjust both. `v-model`: a Date, or the shape set by `valueFormat`.
 */
const props = withDefaults(defineProps<PickerBaseProps & PickerTimeProps>(), {
  locale: 'en-GB',
  clearable: true,
  valueFormat: 'date',
  minuteStep: 1,
  secondStep: 1,
  hourCycle: 24,
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
const dayRules = computed(() => ({ minDate: min.value, maxDate: max.value, disabledDates: props.disabledDates }))
const timeRules = computed(() => ({ minDate: min.value, maxDate: max.value, minTime: props.minTime, maxTime: props.maxTime }))
const timeOptions = computed(() => ({ withSeconds: props.withSeconds, hourCycle: props.hourCycle }))
const pattern = computed(() => props.displayFormat ?? defaultPattern(true, timeOptions.value))
const dayDisabled = (day: Date) => isDayDisabled(day, dayRules.value) || hasNoTime(day, timeRules.value)

const text = computed(() => value.value && formatDisplay(value.value, {
  displayFormat: props.editable ? pattern.value : props.displayFormat,
  locale: props.locale,
  withTime: true,
  ...timeOptions.value,
}))

function emitDate(date: Date | undefined) {
  model.value = formatWallValue(date, props.valueFormat, props.timeZone)
}

// `day` at `seconds`, moved into that day's allowed time window.
function emitAt(day: Date, seconds: number) {
  emitDate(atTime(day, clampSeconds(seconds, timeBoundsOn(day, timeRules.value))))
}

const editable = computed(() => props.editable
  ? {
      pattern: pattern.value,
      onCommit: (typed: string) => {
        const date = parseDatePattern(typed, pattern.value)
        if (!date || dayDisabled(date))
          return false
        const bounds = timeBoundsOn(date, timeRules.value)
        if (secondsOfDay(date) < bounds.min || secondsOfDay(date) > bounds.max)
          return false
        emitDate(date)
        return true
      },
    }
  : undefined)

function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    month.value = toCalendarDate(value.value ?? min.value ?? wallNow(props.timeZone))
}

// Keep the time when the day changes (moved into the new day's window).
function selectDay(day: DateValue | undefined) {
  if (day)
    emitAt(fromCalendarDate(day), value.value ? secondsOfDay(value.value) : 0)
}

// No day yet: today, or the first allowed day.
function selectTime(seconds: number) {
  const now = wallNow(props.timeZone)
  const day = value.value ?? firstEnabledDay(min.value && min.value > now ? min.value : now, dayDisabled)
  if (day)
    emitAt(day, seconds)
}

function pickNow() {
  const now = wallNow(props.timeZone)
  const seconds = secondsOfDay(now)
  emitAt(now, props.withSeconds ? seconds - (seconds % props.secondStep) : seconds - (seconds % (props.minuteStep * 60)))
  month.value = toCalendarDate(now)
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PickerTrigger
      :id="id"
      :text="text"
      :placeholder="placeholder ?? (editable ? pattern.toLowerCase() : 'Pick date & time')"
      :disabled="disabled"
      :clearable="clearable"
      :invalid="invalid"
      :labels="labels"
      :editable="editable"
      :class="props.class"
      @clear="emitDate(undefined)"
    />
    <PopoverContent align="start" class="w-auto p-0">
      <div class="flex">
        <Calendar
          :model-value="calendarValue"
          :placeholder="month"
          :min-value="toCalendarDate(min)"
          :max-value="toCalendarDate(max)"
          :is-date-disabled="(day: DateValue) => dayDisabled(fromCalendarDate(day))"
          :locale="locale"
          layout="month-and-year"
          prevent-deselect
          @update:placeholder="(day: DateValue) => (month = day)"
          @update:model-value="(day) => selectDay(day as DateValue | undefined)"
        />
        <TimeColumns
          :value="value && secondsOfDay(value)"
          :bounds="timeBoundsOn(value, timeRules)"
          :minute-step="minuteStep"
          :second-step="secondStep"
          :with-seconds="withSeconds"
          :hour-cycle="hourCycle"
          @change="selectTime"
        />
      </div>
      <PickerFooter
        :labels="labels"
        :time-zone="timeZone"
        show-now
        :now-disabled="dayDisabled(wallNow(timeZone))"
        @now="pickNow"
        @done="open = false"
      />
    </PopoverContent>
  </Popover>
</template>
