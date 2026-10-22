import { DATE_TOKENS, formatDatePattern, parseDatePattern } from './date-value'

/** Days that can't be picked: a list of days, or a test such as `(d) => d.getDay() === 0`. */
export type DisabledDates = Date[] | ((date: Date) => boolean)

export type HourCycle = 12 | 24

export type TimeOptions = {
  /** Add a seconds column and show seconds. */
  withSeconds?: boolean
  /** 24 (default) or 12 with AM/PM. */
  hourCycle?: HourCycle
}

/** Allowed time window inside one day, in seconds since midnight (inclusive). */
export type TimeBounds = { min: number; max: number }

export const FULL_DAY: TimeBounds = { min: 0, max: 24 * 3600 - 1 }

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const isSameDay = (a: Date | undefined, b: Date | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Whole days from `b` to `a`. */
export const diffInDays = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000)

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes(), date.getSeconds())

export const secondsOfDay = (date: Date) => date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()

/** `day` at `seconds` since midnight. */
export const atTime = (day: Date, seconds: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60)

/** '09:30' / '17:45:30' → seconds since midnight. */
export function parseTimeOfDay(time: string | undefined) {
  const match = time && /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim())
  if (!match)
    return undefined
  const [hours = 0, minutes = 0, seconds = 0] = match.slice(1).map((part) => Number(part ?? 0))
  return hours < 24 && minutes < 60 && seconds < 60 ? hours * 3600 + minutes * 60 + seconds : undefined
}

export const clampSeconds = (seconds: number, bounds: TimeBounds) => Math.min(bounds.max, Math.max(bounds.min, seconds))

export type DayRules = { minDate?: Date; maxDate?: Date; disabledDates?: DisabledDates }

/** Can `day` be picked? minDate / maxDate compare whole days. */
export function isDayDisabled(day: Date, { minDate, maxDate, disabledDates }: DayRules) {
  if (minDate && diffInDays(day, minDate) < 0)
    return true
  if (maxDate && diffInDays(day, maxDate) > 0)
    return true
  if (!disabledDates)
    return false
  return typeof disabledDates === 'function' ? disabledDates(day) : disabledDates.some((d) => isSameDay(d, day))
}

export type TimeRules = { minDate?: Date; maxDate?: Date; minTime?: string; maxTime?: string }

/**
 * Time window on `day`: `minTime`–`maxTime` every day, narrowed by the time
 * of `minDate` / `maxDate` on their own day (e.g. 'not before now').
 */
export function timeBoundsOn(day: Date | undefined, { minDate, maxDate, minTime, maxTime }: TimeRules): TimeBounds {
  let min = parseTimeOfDay(minTime) ?? FULL_DAY.min
  let max = parseTimeOfDay(maxTime) ?? FULL_DAY.max
  if (day && isSameDay(day, minDate)) min = Math.max(min, secondsOfDay(minDate!))
  if (day && isSameDay(day, maxDate)) max = Math.min(max, secondsOfDay(maxDate!))
  return { min, max }
}

/** A day with no allowed time left (e.g. today after `maxTime`) can't be picked either. */
export function hasNoTime(day: Date, rules: TimeRules) {
  const bounds = timeBoundsOn(day, rules)
  return bounds.min > bounds.max
}

/** First day from `start` (within a year) that `isDisabled` lets through. */
export function firstEnabledDay(start: Date, isDisabled: (day: Date) => boolean) {
  for (let i = 0; i < 366; i++) {
    const day = addDays(startOfDay(start), i)
    if (!isDisabled(day))
      return day
  }
  return undefined
}

export type WallRange = { from?: Date; to?: Date }

/**
 * Range rules shared with DateTimeRangePicker: the next click after `from`
 * picks `to`, so with `maxDays` days too far from `from` are disabled.
 */
export function rangeDayDisabled(day: Date, isDisabled: (day: Date) => boolean, { from, to }: WallRange, maxDays?: number) {
  if (isDisabled(day))
    return true
  return !!(maxDays && from && !to && Math.abs(diffInDays(day, from)) > maxDays - 1)
}

/** Typed 'from – to' → a valid range, or undefined. */
export function parseTypedRange(text: string, pattern: string, isDisabled: (day: Date) => boolean, maxDays?: number) {
  const { from, to } = parseRangeText(text, pattern)
  if (!from || isDisabled(from))
    return undefined
  if (to && (isDisabled(to) || to < from))
    return undefined
  if (to && maxDays && diffInDays(to, from) > maxDays - 1)
    return undefined
  return { from, to }
}

/** The day a click lands on → the next range: start fresh, or end it (an earlier day swaps). */
export function nextRange(day: Date, { from, to }: WallRange): { from: Date; to?: Date } {
  if (!from || to)
    return { from: day }
  return diffInDays(day, from) < 0 ? { from: day, to: from } : { from, to: day }
}

/** Keep a preset inside minDate / maxDate. */
export function clampRange({ from, to }: { from: Date; to: Date }, { minDate, maxDate }: DayRules) {
  const lower = minDate && diffInDays(from, minDate) < 0 ? startOfDay(minDate) : from
  const upper = maxDate && diffInDays(to, maxDate) > 0 ? startOfDay(maxDate) : to
  return { from: lower, to: upper }
}

/** Pattern used when the user can type the value (and no displayFormat is set). */
export function defaultPattern(withTime: boolean, { withSeconds, hourCycle = 24 }: TimeOptions = {}) {
  if (!withTime)
    return 'dd/MM/yyyy'
  const hours = hourCycle === 12 ? 'hh' : 'HH'
  return `dd/MM/yyyy ${hours}:mm${withSeconds ? ':ss' : ''}${hourCycle === 12 ? ' a' : ''}`
}

export type DisplayOptions = TimeOptions & { displayFormat?: string; locale?: string; withTime?: boolean }

/** Text shown in the trigger: `displayFormat` if set, else the locale's short format. */
export function formatDisplay(date: Date, { displayFormat, locale, withTime, withSeconds, hourCycle = 24 }: DisplayOptions) {
  if (displayFormat)
    return formatDatePattern(date, displayFormat)
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds && { second: '2-digit' }),
      hourCycle: hourCycle === 12 ? 'h12' : 'h23',
    }),
  })
}

/** Separator between the two ends of a range, in the trigger and when typing. */
export const RANGE_SEPARATOR = ' – '

export const parseRangeText = (text: string, pattern: string) => {
  const [from, to] = text.split(RANGE_SEPARATOR.trim()).map((part) => part.trim())
  return { from: from ? parseDatePattern(from, pattern) : undefined, to: to ? parseDatePattern(to, pattern) : undefined }
}

type MaskPart = { kind: 'literal'; text: string } | { kind: 'digits'; size: number } | { kind: 'period' }

const FIXED_WIDTH: Record<string, number> = { yyyy: 4, MM: 2, dd: 2, HH: 2, hh: 2, mm: 2, ss: 2 }

function maskParts(pattern: string): MaskPart[] | undefined {
  const parts: MaskPart[] = []
  let last = 0
  for (const match of pattern.matchAll(DATE_TOKENS)) {
    if (match.index > last) parts.push({ kind: 'literal', text: pattern.slice(last, match.index) })
    const token = match[0]
    if (token.startsWith("'")) parts.push({ kind: 'literal', text: token.slice(1, -1) })
    else if (token === 'a') parts.push({ kind: 'period' })
    else if (FIXED_WIDTH[token]) parts.push({ kind: 'digits', size: FIXED_WIDTH[token] })
    else return undefined // M, d, H, h: variable width, can't mask
    last = match.index + token.length
  }
  if (last < pattern.length) parts.push({ kind: 'literal', text: pattern.slice(last) })
  return parts
}

/**
 * Re-format typed text to `pattern` as the user types: '15102026' →
 * '15/10/2026'. Separators are added only once a digit follows them, so
 * backspace works; 'p' / 'a' fill an AM/PM slot.
 */
export function maskDateInput(text: string, pattern: string) {
  const parts = maskParts(pattern)
  if (!parts)
    return text
  let digits = text.replace(/\D/g, '')
  let periods = text.replace(/[^ap]/gi, '').toLowerCase()
  let out = ''
  let pending = ''
  for (const part of parts) {
    if (part.kind === 'literal') {
      pending += part.text
    } else if (part.kind === 'digits') {
      if (!digits) break
      out += pending + digits.slice(0, part.size)
      pending = ''
      const complete = digits.length >= part.size
      digits = digits.slice(part.size)
      if (!complete) break
    } else {
      if (!periods) break
      out += pending + (periods[0] === 'a' ? 'AM' : 'PM')
      pending = ''
      periods = periods.slice(1)
    }
  }
  return out
}

export type DateRangePreset = {
  label: string
  /** Range for `today` (start of today, in the picker's time zone). */
  range: (today: Date) => { from: Date; to: Date }
}

/** Common presets for DateRangePicker; pass your own labels to translate them. */
export function createRangePresets(
  labels: Partial<Record<'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth', string>> = {}
): DateRangePreset[] {
  const l = {
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    ...labels,
  }
  return [
    { label: l.today, range: (today) => ({ from: today, to: today }) },
    { label: l.yesterday, range: (today) => ({ from: addDays(today, -1), to: addDays(today, -1) }) },
    { label: l.last7, range: (today) => ({ from: addDays(today, -6), to: today }) },
    { label: l.last30, range: (today) => ({ from: addDays(today, -29), to: today }) },
    {
      label: l.thisMonth,
      range: (today) => ({ from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date(today.getFullYear(), today.getMonth() + 1, 0) }),
    },
    {
      label: l.lastMonth,
      range: (today) => ({ from: new Date(today.getFullYear(), today.getMonth() - 1, 1), to: new Date(today.getFullYear(), today.getMonth(), 0) }),
    },
  ]
}

/** Texts inside the popovers; override to translate. */
export type PickerLabels = {
  now: string
  done: string
  start: string
  end: string
  clear: string
  openCalendar: string
}

export const DEFAULT_LABELS: PickerLabels = {
  now: 'Now',
  done: 'Done',
  start: 'Start',
  end: 'End',
  clear: 'Clear',
  openCalendar: 'Open calendar',
}
