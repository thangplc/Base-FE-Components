"use client"

import { useState, type Ref } from "react"
import { CalendarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  formatDateValue,
  parseDateValue,
  type DateLike,
  type DateRange,
  type DateValueFormat,
} from "./date-value"

export type { DateLike, DateRange, DateValueFormat } from "./date-value"

type BaseProps = {
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
   * Shape of `value` / `onChange`: "date" (default), "iso", "timestamp",
   * a pattern like "yyyy-MM-dd", or a `{ format, parse }` codec.
   */
  valueFormat?: DateValueFormat
  id?: string
  className?: string
  "aria-invalid"?: boolean
  /** The trigger button (react-hook-form focuses it on a validation error). */
  ref?: Ref<HTMLButtonElement>
}

export type DatePickerProps<T extends DateLike = Date> = BaseProps & {
  value?: T | null
  onChange?: (value: T | undefined) => void
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Day-level min/max as react-day-picker `disabled` matchers. */
function disabledDays(minDate?: Date, maxDate?: Date) {
  return [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
  ]
}

/** First day of the week for a locale (Mon in vi-VN / en-GB, Sun in en-US), like Reka's calendar. */
function weekStartsOn(locale: string) {
  const info = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number }
    weekInfo?: { firstDay: number }
  }
  const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay ?? 1 // 1 = Monday … 7 = Sunday
  return (firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
}

/** Month / year dropdowns span the allowed range (default: 100 years back, 10 ahead). */
function monthRange(minDate?: Date, maxDate?: Date) {
  const year = new Date().getFullYear()
  return {
    startMonth: minDate ?? new Date(year - 100, 0),
    endMonth: maxDate ?? new Date(year + 10, 11),
  }
}

const formatDay = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" })

/** Outline button showing the value, with an optional clear (×) on the right. */
function PickerTrigger({
  id,
  ref,
  text,
  placeholder,
  disabled,
  clearable,
  onClear,
  className,
  invalid,
}: {
  id?: string
  ref?: Ref<HTMLButtonElement>
  text?: string
  placeholder: string
  disabled?: boolean
  clearable: boolean
  onClear: () => void
  className?: string
  invalid?: boolean
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={ref}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            "w-full justify-start font-normal",
            !text && "text-muted-foreground",
            clearable && text && "pr-8"
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          <span className="truncate">{text ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      {clearable && text && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={onClear}
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

/** Pick a day from a calendar in a popover (react-day-picker). */
export function DatePicker<T extends DateLike = Date>({
  value: valueProp,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  disabled,
  locale = "en-GB",
  clearable = true,
  valueFormat = "date",
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DatePickerProps<T>) {
  const [open, setOpen] = useState(false)
  const value = parseDateValue(valueProp, valueFormat)
  const emit = (date: Date | undefined) => onChange?.(formatDateValue(date, valueFormat) as T | undefined)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger
        id={id}
        ref={ref}
        text={value && formatDay(value, locale)}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onClear={() => emit(undefined)}
        className={className}
        invalid={invalid}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? minDate}
          onSelect={(day) => {
            emit(day)
            setOpen(false)
          }}
          disabled={disabledDays(minDate, maxDate)}
          captionLayout="dropdown"
          weekStartsOn={weekStartsOn(locale)}
          {...monthRange(minDate, maxDate)}
        />
      </PopoverContent>
    </Popover>
  )
}

export type DateTimePickerProps<T extends DateLike = Date> = DatePickerProps<T> & {
  /** Minutes between selectable times in the time field (default 1). */
  minuteStep?: number
}

const pad = (n: number) => String(n).padStart(2, "0")

/** Pick a day and a time (HH:mm); the popover stays open to adjust both. */
export function DateTimePicker<T extends DateLike = Date>({
  value: valueProp,
  onChange,
  placeholder = "Pick date & time",
  minDate,
  maxDate,
  disabled,
  locale = "en-GB",
  clearable = true,
  valueFormat = "date",
  minuteStep = 1,
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DateTimePickerProps<T>) {
  const value = parseDateValue(valueProp, valueFormat)
  const emit = (date: Date | undefined) => onChange?.(formatDateValue(date, valueFormat) as T | undefined)

  const text = value?.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
  const time = value ? `${pad(value.getHours())}:${pad(value.getMinutes())}` : ""

  // Keep the time when the day changes, and the day when the time changes.
  const selectDay = (day: Date | undefined) => {
    if (!day) return emit(undefined)
    const next = new Date(day)
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0)
    emit(next)
  }
  const selectTime = (hhmm: string) => {
    const [hours, minutes] = hhmm.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    const next = new Date(value ?? startOfDay(new Date()))
    next.setHours(hours, minutes, 0, 0)
    emit(next)
  }

  return (
    <Popover>
      <PickerTrigger
        id={id}
        ref={ref}
        text={text}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onClear={() => emit(undefined)}
        className={className}
        invalid={invalid}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? minDate}
          onSelect={selectDay}
          disabled={disabledDays(minDate, maxDate)}
          captionLayout="dropdown"
          weekStartsOn={weekStartsOn(locale)}
          {...monthRange(minDate, maxDate)}
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Label htmlFor={id ? `${id}-time` : undefined} className="text-muted-foreground">
            Time
          </Label>
          <Input
            id={id ? `${id}-time` : undefined}
            type="time"
            step={minuteStep * 60}
            value={time}
            onChange={(event) => selectTime(event.target.value)}
            className="ml-auto w-28"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type DateRangePickerProps<T extends DateLike = Date> = BaseProps & {
  /** `{ from, to }`, each in the shape set by `valueFormat`. */
  value?: DateRange<T> | null
  onChange?: (value: DateRange<T> | undefined) => void
  /** Months shown side by side (default 2; they stack on small screens). */
  numberOfMonths?: number
}

/** Pick a start and an end day; the popover stays open until you close it. */
export function DateRangePicker<T extends DateLike = Date>({
  value: valueProp,
  onChange,
  placeholder = "Pick a date range",
  minDate,
  maxDate,
  disabled,
  locale = "en-GB",
  clearable = true,
  valueFormat = "date",
  numberOfMonths = 2,
  id,
  ref,
  className,
  "aria-invalid": invalid,
}: DateRangePickerProps<T>) {
  const from = parseDateValue(valueProp?.from, valueFormat)
  const to = parseDateValue(valueProp?.to, valueFormat)

  const emit = (range: { from?: Date; to?: Date } | undefined) =>
    onChange?.(
      range?.from || range?.to
        ? {
            from: formatDateValue(range.from, valueFormat) as T | undefined,
            to: formatDateValue(range.to, valueFormat) as T | undefined,
          }
        : undefined
    )

  // First click starts a new range, the second ends it (an earlier day swaps
  // the two). react-day-picker would set `to` on the first click already.
  const selectDay = (day: Date) => {
    if (!from || to) return emit({ from: day })
    emit(day < from ? { from: day, to: from } : { from, to: day })
  }

  const text = from || to ? `${from ? formatDay(from, locale) : "…"} – ${to ? formatDay(to, locale) : "…"}` : undefined

  return (
    <Popover>
      <PickerTrigger
        id={id}
        ref={ref}
        text={text}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onClear={() => emit(undefined)}
        className={className}
        invalid={invalid}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={from || to ? { from, to } : undefined}
          defaultMonth={from ?? minDate}
          onSelect={(_, day) => selectDay(day)}
          numberOfMonths={numberOfMonths}
          disabled={disabledDays(minDate, maxDate)}
          weekStartsOn={weekStartsOn(locale)}
          {...monthRange(minDate, maxDate)}
        />
      </PopoverContent>
    </Popover>
  )
}
