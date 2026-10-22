"use client"

import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type Ref } from "react"
import { CalendarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { PopoverAnchor, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  FULL_DAY,
  clampSeconds,
  isSameDay,
  maskDateInput,
  startOfDay,
  type DateRangePreset,
  type HourCycle,
  type PickerLabels,
  type TimeBounds,
} from "./date-time"
import { toWallTime } from "./date-value"

/** First day of the week for a locale (Mon in vi-VN / en-GB, Sun in en-US), like Reka's calendar. */
export function weekStartsOn(locale: string) {
  const info = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number }
    weekInfo?: { firstDay: number }
  }
  const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay ?? 1 // 1 = Monday … 7 = Sunday
  return (firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
}

/** Wall-clock "now" in `timeZone`. Only call it while the popover is open (Cache Components). */
export const wallNow = (timeZone?: string) => toWallTime(new Date(), timeZone)!

/**
 * Calendar with the kit's defaults: week start from the locale, and month /
 * year dropdowns spanning minDate–maxDate (default 100 years back, 10 ahead).
 * It reads today's date, so it renders inside PopoverContent only.
 */
export function PickerCalendar({
  minDate,
  maxDate,
  localeTag,
  ...props
}: ComponentProps<typeof Calendar> & { minDate?: Date; maxDate?: Date; localeTag: string }) {
  const year = new Date().getFullYear()
  return (
    <Calendar
      weekStartsOn={weekStartsOn(localeTag)}
      startMonth={minDate ?? new Date(year - 100, 0)}
      endMonth={maxDate ?? new Date(year + 10, 11)}
      {...props}
    />
  )
}

type PickerTriggerProps = {
  id?: string
  ref?: Ref<HTMLElement>
  text?: string
  placeholder: string
  disabled?: boolean
  clearable: boolean
  onClear: () => void
  className?: string
  invalid?: boolean
  labels: PickerLabels
  /** Typing: the mask pattern, and a commit that returns false for text it can't use. */
  editable?: { pattern: string; onCommit: (text: string) => boolean }
}

/** Outline button (or a masked input with `editable`) showing the value, with an optional ×. */
export function PickerTrigger({ editable, ...props }: PickerTriggerProps) {
  const { id, ref, text, placeholder, disabled, clearable, onClear, className, invalid, labels } = props
  if (editable) return <EditableTrigger {...props} editable={editable} />

  return (
    <div className={cn("relative w-full", className)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={ref as Ref<HTMLButtonElement>}
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
      {clearable && text && !disabled && <ClearButton label={labels.clear} onClear={onClear} />}
    </div>
  )
}

function ClearButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      className="absolute top-1/2 right-1.5 -translate-y-1/2"
      onClick={onClear}
    >
      <XIcon />
    </Button>
  )
}

function EditableTrigger({
  id,
  ref,
  text,
  placeholder,
  disabled,
  clearable,
  onClear,
  className,
  invalid,
  labels,
  editable,
}: PickerTriggerProps & { editable: NonNullable<PickerTriggerProps["editable"]> }) {
  const [draft, setDraft] = useState(text ?? "")
  const [error, setError] = useState(false)
  // Follow the value when it changes from outside (calendar, clear, form reset).
  const [shown, setShown] = useState(text)
  if (text !== shown) {
    setShown(text)
    setDraft(text ?? "")
    setError(false)
  }

  // Enter keeps bad text (marked invalid) so it can be fixed; blur reverts it.
  const commit = (revertOnError: boolean) => {
    if (draft === (text ?? "")) return setError(false)
    if (!draft.trim()) return onClear()
    if (editable.onCommit(draft)) return setError(false)
    if (revertOnError) {
      setDraft(text ?? "")
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <PopoverAnchor asChild>
      <div className={cn("relative w-full", className)}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={labels.openCalendar}
            disabled={disabled}
            className="absolute top-1/2 left-1.5 z-10 -translate-y-1/2 text-muted-foreground"
          >
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <Input
          id={id}
          ref={ref as Ref<HTMLInputElement>}
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          inputMode={/a/.test(editable.pattern.replace(/'[^']*'/g, "")) ? "text" : "numeric"}
          aria-invalid={invalid || error || undefined}
          className={cn("pl-9", clearable && draft && "pr-8")}
          onChange={(event) => {
            setDraft(maskDateInput(event.target.value, editable.pattern))
            setError(false)
          }}
          onBlur={() => commit(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commit(false)
            } else if (event.key === "Escape") {
              setDraft(text ?? "")
              setError(false)
            }
          }}
        />
        {clearable && draft && !disabled && <ClearButton label={labels.clear} onClear={onClear} />}
      </div>
    </PopoverAnchor>
  )
}

/** Bottom bar of the popover: "Now", the time zone, "Done". */
export function PickerFooter({
  labels,
  timeZone,
  onNow,
  isNowDisabled,
  onDone,
}: {
  labels: PickerLabels
  timeZone?: string
  onNow?: () => void
  isNowDisabled?: () => boolean
  onDone: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-t p-2">
      {onNow && (
        <Button type="button" variant="ghost" size="sm" onClick={onNow} disabled={isNowDisabled?.()}>
          {labels.now}
        </Button>
      )}
      {timeZone && <span className="truncate text-xs text-muted-foreground">{timeZone}</span>}
      <Button type="button" size="sm" className="ml-auto" onClick={onDone}>
        {labels.done}
      </Button>
    </div>
  )
}

/** Preset shortcuts on the left of a range calendar; the active one is highlighted. */
export function RangePresets({
  presets,
  timeZone,
  from,
  to,
  onSelect,
}: {
  presets: DateRangePreset[]
  timeZone?: string
  from?: Date
  to?: Date
  onSelect: (range: { from: Date; to: Date }) => void
}) {
  const today = startOfDay(wallNow(timeZone))
  return (
    <div
      data-slot="range-presets"
      className="flex flex-wrap gap-1 border-b p-2 sm:w-36 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0"
    >
      {presets.map((preset) => {
        const range = preset.range(today)
        const active = isSameDay(range.from, from) && isSameDay(range.to, to)
        return (
          <Button
            key={preset.label}
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className="justify-start font-normal"
            onClick={() => onSelect(range)}
          >
            {preset.label}
          </Button>
        )
      })}
    </div>
  )
}

type TimeColumnsProps = {
  /** Picked time in seconds since midnight; undefined = nothing picked yet. */
  value?: number
  onChange: (seconds: number) => void
  /** Allowed window (other options are disabled). */
  bounds?: TimeBounds
  minuteStep?: number
  secondStep?: number
  withSeconds?: boolean
  hourCycle?: HourCycle
  /** Small heading on top, e.g. "Start". */
  title?: ReactNode
  className?: string
}

type ColumnItem = { key: string | number; label: string; selected: boolean; disabled: boolean; seconds: number }

const pad = (n: number) => String(n).padStart(2, "0")
const steps = (count: number, step: number) => Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step)

/** Scrollable hour / minute (/ second / AM-PM) columns, as tall as their container. */
export function TimeColumns({
  value,
  onChange,
  bounds = FULL_DAY,
  minuteStep = 1,
  secondStep = 1,
  withSeconds = false,
  hourCycle = 24,
  title,
  className,
}: TimeColumnsProps) {
  // Unpicked parts start from the earliest allowed time.
  const base = value ?? bounds.min
  const hour = Math.floor(base / 3600)
  const minute = Math.floor(base / 60) % 60
  const second = withSeconds ? base % 60 : 0
  const pm = hour >= 12
  const picked = value !== undefined
  // Any second of [from, to] inside the bounds?
  const allowed = (from: number, to: number) => to >= bounds.min && from <= bounds.max
  // `seconds` is what a click picks (then clamped); the option is usable if any of [from, to] is allowed.
  const item = (key: string | number, label: string, seconds: number, [from, to]: number[], selected: boolean): ColumnItem => ({
    key,
    label,
    seconds,
    selected: picked && selected,
    disabled: !allowed(from, to),
  })

  const hourValues = hourCycle === 12 ? [12, ...steps(11, 1).map((h) => h + 1)] : steps(24, 1)
  const columns: { label: string; items: ColumnItem[] }[] = [
    {
      label: "Hours",
      items: hourValues.map((h) => {
        const h24 = hourCycle === 12 ? (h % 12) + (pm ? 12 : 0) : h
        return item(h, pad(h), h24 * 3600 + minute * 60 + second, [h24 * 3600, h24 * 3600 + 3599], h24 === hour)
      }),
    },
    {
      label: "Minutes",
      items: steps(60, minuteStep).map((m) => {
        const start = hour * 3600 + m * 60
        return item(m, pad(m), start + second, [start, start + 59], m === minute)
      }),
    },
  ]
  if (withSeconds) {
    columns.push({
      label: "Seconds",
      items: steps(60, secondStep).map((s) => {
        const time = hour * 3600 + minute * 60 + s
        return item(s, pad(s), time, [time, time], s === second)
      }),
    })
  }
  if (hourCycle === 12) {
    const inDay = base % 43200
    columns.push({
      label: "AM/PM",
      items: [
        item("am", "AM", inDay, [0, 43199], !pm),
        item("pm", "PM", 43200 + inDay, [43200, 86399], pm),
      ],
    })
  }

  return (
    <div data-slot="time-columns" className={cn("flex flex-col border-l", className)}>
      {title && (
        <div className="border-b px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">{title}</div>
      )}
      <div className="relative min-h-48 flex-1" style={{ width: `${columns.length * 3}rem` }}>
        <div className="absolute inset-0 flex divide-x">
          {columns.map((column) => (
            <TimeColumn
              key={column.label}
              label={column.label}
              items={column.items}
              onSelect={(seconds) => onChange(clampSeconds(seconds, bounds))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TimeColumn({ label, items, onSelect }: { label: string; items: ColumnItem[]; onSelect: (seconds: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  const selected = items.findIndex((i) => i.selected)

  // Scroll the picked option to the top (instantly when the popover opens).
  useEffect(() => {
    const column = ref.current
    const option = column?.querySelector<HTMLElement>("[data-selected=true]")
    if (column && option) column.scrollTo({ top: option.offsetTop - 4, behavior: mounted.current ? "smooth" : "instant" })
    mounted.current = true
  }, [selected])

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      className="relative flex-1 overflow-y-auto overscroll-contain p-1 [scrollbar-width:none] after:block after:h-[calc(100%-2.25rem)] after:content-['']"
    >
      {items.map((option) => (
        <button
          key={option.key}
          type="button"
          role="option"
          aria-selected={option.selected}
          data-selected={option.selected}
          disabled={option.disabled}
          onClick={() => onSelect(option.seconds)}
          className={cn(
            "flex h-7 w-full items-center justify-center rounded-md text-sm tabular-nums outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35",
            option.selected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
