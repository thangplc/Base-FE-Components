"use client"

import { useState } from "react"

import { Popover, PopoverContent } from "@/components/ui/popover"
import {
  DEFAULT_LABELS,
  atTime,
  clampSeconds,
  defaultPattern,
  firstEnabledDay,
  formatDisplay,
  hasNoTime,
  isDayDisabled,
  secondsOfDay,
  timeBoundsOn,
} from "./date-time"
import { formatWallValue, parseDatePattern, parseWallValue, toWallTime, type DateLike } from "./date-value"
import type { DatePickerProps } from "./date-picker"
import { PickerCalendar, PickerFooter, PickerTrigger, TimeColumns, wallNow } from "./picker-parts"
import type { PickerTimeProps } from "./types"

export type DateTimePickerProps<T extends DateLike = Date> = DatePickerProps<T> & PickerTimeProps

/** Pick a day and a time (hour / minute columns); the popover stays open to adjust both. */
export function DateTimePicker<T extends DateLike = Date>({
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
}: DateTimePickerProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>()

  // Everything inside works on wall-clock Dates in `timeZone`.
  const value = parseWallValue(valueProp, valueFormat, timeZone)
  const min = toWallTime(minDate, timeZone)
  const max = toWallTime(maxDate, timeZone)
  const dayRules = { minDate: min, maxDate: max, disabledDates }
  const timeRules = { minDate: min, maxDate: max, minTime, maxTime }
  const timeOptions = { withSeconds, hourCycle }
  const dayDisabled = (day: Date) => isDayDisabled(day, dayRules) || hasNoTime(day, timeRules)
  const pattern = displayFormat ?? defaultPattern(true, timeOptions)

  const emit = (date: Date | undefined) => onChange?.(formatWallValue(date, valueFormat, timeZone) as T | undefined)
  // `day` at `seconds`, moved into that day's allowed time window.
  const emitAt = (day: Date, seconds: number) => emit(atTime(day, clampSeconds(seconds, timeBoundsOn(day, timeRules))))

  const roundToStep = (seconds: number) =>
    withSeconds ? seconds - (seconds % secondStep) : seconds - (seconds % (minuteStep * 60))

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setMonth(value ?? min)
      }}
    >
      <PickerTrigger
        id={id}
        ref={ref}
        text={value && formatDisplay(value, { displayFormat: editable ? pattern : displayFormat, locale, withTime: true, ...timeOptions })}
        placeholder={placeholder ?? (editable ? pattern.toLowerCase() : "Pick date & time")}
        disabled={disabled}
        clearable={clearable}
        onClear={() => emit(undefined)}
        className={className}
        invalid={invalid}
        labels={labels}
        editable={
          editable
            ? {
                pattern,
                onCommit: (text) => {
                  const date = parseDatePattern(text, pattern)
                  if (!date || dayDisabled(date)) return false
                  const bounds = timeBoundsOn(date, timeRules)
                  const seconds = secondsOfDay(date)
                  if (seconds < bounds.min || seconds > bounds.max) return false
                  emit(date)
                  return true
                },
              }
            : undefined
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex">
          <PickerCalendar
            mode="single"
            required
            selected={value}
            month={month}
            onMonthChange={setMonth}
            // Keep the time when the day changes (moved into the new day's window).
            onSelect={(day) => emitAt(day, value ? secondsOfDay(value) : 0)}
            disabled={dayDisabled}
            captionLayout="dropdown"
            minDate={min}
            maxDate={max}
            localeTag={locale}
          />
          <TimeColumns
            value={value && secondsOfDay(value)}
            // No day yet: today, or the first allowed day.
            onChange={(seconds) => {
              const day = value ?? firstEnabledDay(min && min > wallNow(timeZone) ? min : wallNow(timeZone), dayDisabled)
              if (day) emitAt(day, seconds)
            }}
            bounds={timeBoundsOn(value, timeRules)}
            minuteStep={minuteStep}
            secondStep={secondStep}
            {...timeOptions}
          />
        </div>
        <PickerFooter
          labels={labels}
          timeZone={timeZone}
          onNow={() => {
            const now = wallNow(timeZone)
            emitAt(now, roundToStep(secondsOfDay(now)))
            setMonth(now)
          }}
          isNowDisabled={() => dayDisabled(wallNow(timeZone))}
          onDone={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
