"use client"

import { useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type BaseProps = {
  value?: Date
  onChange?: (value: Date | undefined) => void
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
  className?: string
  "aria-invalid"?: boolean
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

/** Outline button showing the value, with an optional clear (×) on the right. */
function PickerTrigger({
  id,
  text,
  placeholder,
  disabled,
  clearable,
  onClear,
  className,
  invalid,
}: {
  id?: string
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
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  disabled,
  locale = "en-GB",
  clearable = true,
  id,
  className,
  "aria-invalid": invalid,
}: BaseProps) {
  const [open, setOpen] = useState(false)
  const text = value?.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger
        id={id}
        text={text}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onClear={() => onChange?.(undefined)}
        className={className}
        invalid={invalid}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? minDate}
          onSelect={(day) => {
            onChange?.(day)
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

type DateTimePickerProps = BaseProps & {
  /** Minutes between selectable times in the time field (default 1). */
  minuteStep?: number
}

const pad = (n: number) => String(n).padStart(2, "0")

/** Pick a day and a time (HH:mm); the popover stays open to adjust both. */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  minDate,
  maxDate,
  disabled,
  locale = "en-GB",
  clearable = true,
  minuteStep = 1,
  id,
  className,
  "aria-invalid": invalid,
}: DateTimePickerProps) {
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
    if (!day) return onChange?.(undefined)
    const next = new Date(day)
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0)
    onChange?.(next)
  }
  const selectTime = (hhmm: string) => {
    const [hours, minutes] = hhmm.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    const next = new Date(value ?? startOfDay(new Date()))
    next.setHours(hours, minutes, 0, 0)
    onChange?.(next)
  }

  return (
    <Popover>
      <PickerTrigger
        id={id}
        text={text}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onClear={() => onChange?.(undefined)}
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
