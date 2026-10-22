"use client"

import { useState } from "react"

import { Popover, PopoverContent } from "@/components/ui/popover"
import { DEFAULT_LABELS, defaultPattern, formatDisplay, isDayDisabled, startOfDay } from "./date-time"
import { formatWallValue, parseDatePattern, parseWallValue, toWallTime, type DateLike } from "./date-value"
import { PickerCalendar, PickerTrigger } from "./picker-parts"
import type { PickerBaseProps } from "./types"

export type DatePickerProps<T extends DateLike = Date> = PickerBaseProps & {
  value?: T | null
  onChange?: (value: T | undefined) => void
  /** Month / year as dropdowns (default) or a plain label. */
  captionLayout?: "dropdown" | "label"
}

/** Pick a day from a calendar in a popover (react-day-picker). */
export function DatePicker<T extends DateLike = Date>({
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
  captionLayout = "dropdown",
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DatePickerProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>()

  // Everything inside works on wall-clock Dates in `timeZone`.
  const value = parseWallValue(valueProp, valueFormat, timeZone)
  const min = toWallTime(minDate, timeZone)
  const max = toWallTime(maxDate, timeZone)
  const rules = { minDate: min, maxDate: max, disabledDates }
  const pattern = displayFormat ?? defaultPattern(false)

  const emit = (day: Date | undefined) =>
    onChange?.(formatWallValue(day && startOfDay(day), valueFormat, timeZone) as T | undefined)

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
        text={value && formatDisplay(value, { displayFormat: editable ? pattern : displayFormat, locale })}
        placeholder={placeholder ?? (editable ? pattern.toLowerCase() : "Pick a date")}
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
                  const day = parseDatePattern(text, pattern)
                  if (!day || isDayDisabled(day, rules)) return false
                  emit(day)
                  return true
                },
              }
            : undefined
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <PickerCalendar
          mode="single"
          required
          selected={value}
          month={month}
          onMonthChange={setMonth}
          onSelect={(day) => {
            emit(day)
            setOpen(false)
          }}
          disabled={(day) => isDayDisabled(day, rules)}
          captionLayout={captionLayout}
          minDate={min}
          maxDate={max}
          localeTag={locale}
        />
      </PopoverContent>
    </Popover>
  )
}
