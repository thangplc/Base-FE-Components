import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'

/** JS Date (public API) → CalendarDate (Reka calendar), day precision. */
export function toCalendarDate(date: Date | undefined) {
  return date ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) : undefined
}

/** CalendarDate → JS Date at local midnight. */
export function fromCalendarDate(value: DateValue) {
  return value.toDate(getLocalTimeZone())
}

export const pad = (n: number) => String(n).padStart(2, '0')
