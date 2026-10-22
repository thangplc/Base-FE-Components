import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { toWallTime } from './date-value'

/** (Wall-clock) Date → CalendarDate for the Reka calendars, day precision. */
export function toCalendarDate(date: Date | undefined) {
  return date ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) : undefined
}

/** CalendarDate → JS Date at local midnight. */
export function fromCalendarDate(value: DateValue) {
  return value.toDate(getLocalTimeZone())
}


/** Wall-clock "now" in `timeZone` (the browser's when unset). */
export const wallNow = (timeZone?: string) => toWallTime(new Date(), timeZone)!
