"use client"

import { useState } from "react"

import { Popover, PopoverContent } from "@/components/ui/popover"
import {
  DEFAULT_LABELS,
  RANGE_SEPARATOR,
  atTime,
  clampRange,
  clampSeconds,
  createRangePresets,
  defaultPattern,
  formatDisplay,
  hasNoTime,
  isDayDisabled,
  isSameDay,
  nextRange,
  parseTypedRange,
  rangeDayDisabled,
  secondsOfDay,
  timeBoundsOn,
  type TimeBounds,
} from "./date-time"
import { formatWallValue, parseWallValue, toWallTime, type DateLike } from "./date-value"
import type { DateRangePickerProps } from "./date-range-picker"
import { PickerCalendar, PickerFooter, PickerTrigger, RangePresets, TimeColumns } from "./picker-parts"
import type { PickerTimeProps } from "./types"

export type DateTimeRangePickerProps<T extends DateLike = Date> = DateRangePickerProps<T> & PickerTimeProps

/**
 * Pick a start and an end moment: the range calendar plus Start / End time
 * columns. Before a day is picked the columns preset its time; the end
 * can't be before the start on the same day.
 */
export function DateTimeRangePicker<T extends DateLike = Date>({
  value: valueProp,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabledDates,
  disabled,
  locale = "en-GB",
  clearable = true,
  valueFormat = "date",
  displayFormat,
  editable = false,
  timeZone,
  labels: labelsProp,
  numberOfMonths = 1,
  maxDays,
  presets,
  minuteStep = 1,
  secondStep = 1,
  withSeconds = false,
  hourCycle = 24,
  minTime,
  maxTime,
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DateTimeRangePickerProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>()
  // Times for a side whose day isn't picked yet (end defaults to the end of the day).
  const endOfDay = withSeconds ? 86399 : 86340
  const [pending, setPending] = useState({ from: 0, to: endOfDay })

  // Everything inside works on wall-clock Dates in `timeZone`.
  const from = parseWallValue(valueProp?.from, valueFormat, timeZone)
  const to = parseWallValue(valueProp?.to, valueFormat, timeZone)
  const min = toWallTime(minDate, timeZone)
  const max = toWallTime(maxDate, timeZone)
  const dayRules = { minDate: min, maxDate: max, disabledDates }
  const timeRules = { minDate: min, maxDate: max, minTime, maxTime }
  const timeOptions = { withSeconds, hourCycle }
  const dayDisabled = (day: Date) => isDayDisabled(day, dayRules) || hasNoTime(day, timeRules)
  const pattern = displayFormat ?? defaultPattern(true, timeOptions)
  const presetList = presets === true ? createRangePresets() : presets || []

  const fromTime = from ? secondsOfDay(from) : pending.from
  const toTime = to ? secondsOfDay(to) : pending.to
  // On one day, the end can't be before the start (and vice versa).
  const sameDay = isSameDay(from, to)
  const fromBounds = timeBoundsOn(from, timeRules)
  const toBounds = timeBoundsOn(to, timeRules)
  if (sameDay) fromBounds.max = Math.min(fromBounds.max, toTime)
  if (sameDay) toBounds.min = Math.max(toBounds.min, fromTime)

  const at = (day: Date, seconds: number, bounds?: TimeBounds) =>
    atTime(day, clampSeconds(seconds, bounds ?? timeBoundsOn(day, timeRules)))

  const emit = (range: { from?: Date; to?: Date } | undefined) => {
    let next = range
    if (next?.from && next.to && next.to < next.from) next = { ...next, to: next.from }
    const out = (date?: Date) => formatWallValue(date, valueFormat, timeZone) as T | undefined
    onChange?.(next?.from || next?.to ? { from: out(next.from), to: out(next.to) } : undefined)
  }

  // Each end keeps its side's time (moved into that day's window).
  const selectDay = (day: Date) => {
    const range = nextRange(day, { from, to })
    emit({ from: at(range.from, fromTime), to: range.to && at(range.to, toTime) })
  }

  const show = (date: Date) =>
    formatDisplay(date, { displayFormat: editable ? pattern : displayFormat, locale, withTime: true, ...timeOptions })
  const text = from || to ? `${from ? show(from) : "…"}${RANGE_SEPARATOR}${to ? show(to) : "…"}` : undefined

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setMonth(from ?? min)
      }}
    >
      <PickerTrigger
        id={id}
        ref={ref}
        text={text}
        placeholder={placeholder ?? (editable ? `${pattern}${RANGE_SEPARATOR}${pattern}`.toLowerCase() : "Pick a date & time range")}
        disabled={disabled}
        clearable={clearable}
        onClear={() => emit(undefined)}
        className={className}
        invalid={invalid}
        labels={labels}
        editable={
          editable
            ? {
                pattern: `${pattern}${RANGE_SEPARATOR}${pattern}`,
                onCommit: (typed) => {
                  const range = parseTypedRange(typed, pattern, dayDisabled, maxDays)
                  const fits = (date: Date) => {
                    const bounds = timeBoundsOn(date, timeRules)
                    return secondsOfDay(date) >= bounds.min && secondsOfDay(date) <= bounds.max
                  }
                  if (!range || !fits(range.from) || (range.to && !fits(range.to))) return false
                  emit(range)
                  return true
                },
              }
            : undefined
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          {presetList.length > 0 && (
            <RangePresets
              presets={presetList}
              timeZone={timeZone}
              from={from}
              to={to}
              onSelect={(range) => {
                const days = clampRange(range, dayRules)
                emit({ from: at(days.from, 0), to: at(days.to, endOfDay) })
                setMonth(range.from)
              }}
            />
          )}
          <div className="flex">
            <PickerCalendar
              mode="range"
              selected={from || to ? { from, to } : undefined}
              month={month}
              onMonthChange={setMonth}
              onSelect={(_, day) => selectDay(day)}
              numberOfMonths={numberOfMonths}
              disabled={(day) => rangeDayDisabled(day, dayDisabled, { from, to }, maxDays)}
              minDate={min}
              maxDate={max}
              localeTag={locale}
            />
            <TimeColumns
              title={labels.start}
              value={fromTime}
              onChange={(seconds) => (from ? emit({ from: atTime(from, seconds), to }) : setPending((p) => ({ ...p, from: seconds })))}
              bounds={fromBounds}
              minuteStep={minuteStep}
              secondStep={secondStep}
              {...timeOptions}
            />
            <TimeColumns
              title={labels.end}
              value={toTime}
              onChange={(seconds) => (to ? emit({ from, to: atTime(to, seconds) }) : setPending((p) => ({ ...p, to: seconds })))}
              bounds={toBounds}
              minuteStep={minuteStep}
              secondStep={secondStep}
              {...timeOptions}
            />
          </div>
        </div>
        <PickerFooter labels={labels} timeZone={timeZone} onDone={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
