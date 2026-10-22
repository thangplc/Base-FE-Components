"use client"

import { useState } from "react"

import { Popover, PopoverContent } from "@/components/ui/popover"
import {
  DEFAULT_LABELS,
  RANGE_SEPARATOR,
  clampRange,
  createRangePresets,
  defaultPattern,
  formatDisplay,
  isDayDisabled,
  nextRange,
  parseTypedRange,
  rangeDayDisabled,
  startOfDay,
  type WallRange,
} from "./date-time"
import { formatWallValue, parseWallValue, toWallTime, type DateLike, type DateRange } from "./date-value"
import { PickerCalendar, PickerTrigger, RangePresets } from "./picker-parts"
import type { PickerBaseProps, PickerRangeProps } from "./types"

export type DateRangePickerProps<T extends DateLike = Date> = PickerBaseProps &
  PickerRangeProps & {
    /** `{ from, to }`, each in the shape set by `valueFormat`. */
    value?: DateRange<T> | null
    onChange?: (value: DateRange<T> | undefined) => void
  }

/** Pick a start and an end day; the popover stays open until you close it. */
export function DateRangePicker<T extends DateLike = Date>({
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
  numberOfMonths = 2,
  maxDays,
  presets,
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DateRangePickerProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>()

  // Everything inside works on wall-clock Dates in `timeZone`.
  const from = parseWallValue(valueProp?.from, valueFormat, timeZone)
  const to = parseWallValue(valueProp?.to, valueFormat, timeZone)
  const min = toWallTime(minDate, timeZone)
  const max = toWallTime(maxDate, timeZone)
  const rules = { minDate: min, maxDate: max, disabledDates }
  const pattern = displayFormat ?? defaultPattern(false)
  const presetList = presets === true ? createRangePresets() : presets || []

  const emit = (range: WallRange | undefined) => {
    const out = (day?: Date) => formatWallValue(day && startOfDay(day), valueFormat, timeZone) as T | undefined
    onChange?.(range?.from || range?.to ? { from: out(range.from), to: out(range.to) } : undefined)
  }

  const show = (day: Date) => formatDisplay(day, { displayFormat: editable ? pattern : displayFormat, locale })
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
        placeholder={placeholder ?? (editable ? `${pattern}${RANGE_SEPARATOR}${pattern}`.toLowerCase() : "Pick a date range")}
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
                  const range = parseTypedRange(typed, pattern, (day) => isDayDisabled(day, rules), maxDays)
                  if (range) emit(range)
                  return !!range
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
                emit(clampRange(range, rules))
                setMonth(range.from)
              }}
            />
          )}
          <PickerCalendar
            mode="range"
            selected={from || to ? { from, to } : undefined}
            month={month}
            onMonthChange={setMonth}
            // react-day-picker would set `to` on the first click already.
            onSelect={(_, day) => emit(nextRange(day, { from, to }))}
            numberOfMonths={numberOfMonths}
            disabled={(day) => rangeDayDisabled(day, (d) => isDayDisabled(d, rules), { from, to }, maxDays)}
            minDate={min}
            maxDate={max}
            localeTag={locale}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
