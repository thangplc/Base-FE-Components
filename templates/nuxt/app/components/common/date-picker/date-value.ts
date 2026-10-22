/** What a date picker accepts and emits, depending on `valueFormat`. */
export type DateLike = Date | string | number

export type DateRange<T extends DateLike = Date> = { from?: T; to?: T }

/** Convert to / from anything else (e.g. a dayjs object, a Unix timestamp in seconds). */
export type DateCodec<T = unknown> = {
  format: (date: Date) => T
  parse: (value: T) => Date | undefined
}

/**
 * Shape of the value a picker emits (and accepts back):
 * - `'date'` (default): a JS `Date`
 * - `'iso'`: ISO 8601 string in UTC (`Date#toISOString`)
 * - `'timestamp'`: milliseconds since epoch
 * - a pattern, e.g. `'yyyy-MM-dd'` or `'dd/MM/yyyy HH:mm'`: wall-clock time
 *   (local, or in the picker's `timeZone`). Tokens: yyyy MM M dd d HH H hh h
 *   mm ss a (AM/PM); quote literal text: `"yyyy-MM-dd'T'HH:mm"`
 * - a `{ format, parse }` codec
 *
 * For date-only fields prefer a pattern like `'yyyy-MM-dd'`: `'iso'` turns
 * local midnight into UTC, which can show the previous day.
 */
export type DateValueFormat = 'date' | 'iso' | 'timestamp' | (string & {}) | DateCodec<any>

export const DATE_TOKENS = /'[^']*'|yyyy|MM|dd|HH|hh|mm|ss|M|d|H|h|a/g

const TOKEN_SOURCE: Record<string, string> = {
  yyyy: '(\\d{4})',
  MM: '(\\d{2})',
  dd: '(\\d{2})',
  HH: '(\\d{2})',
  hh: '(\\d{2})',
  mm: '(\\d{2})',
  ss: '(\\d{2})',
  M: '(\\d{1,2})',
  d: '(\\d{1,2})',
  H: '(\\d{1,2})',
  h: '(\\d{1,2})',
  a: '(AM|PM|am|pm)',
}

const pad = (n: number, length = 2) => String(n).padStart(length, '0')

/** Format a date with a pattern such as 'dd/MM/yyyy HH:mm' (the date's own fields). */
export function formatDatePattern(date: Date, pattern: string) {
  const hours = date.getHours()
  const h12 = hours % 12 || 12
  const parts: Record<string, string> = {
    yyyy: pad(date.getFullYear(), 4),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    dd: pad(date.getDate()),
    d: String(date.getDate()),
    HH: pad(hours),
    H: String(hours),
    hh: pad(h12),
    h: String(h12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    a: hours < 12 ? 'AM' : 'PM',
  }
  return pattern.replace(DATE_TOKENS, (token) => (token.startsWith("'") ? token.slice(1, -1) : (parts[token] ?? token)))
}

/** Parse a string written with `pattern`; undefined if it doesn't match or isn't a real date / time. */
export function parseDatePattern(value: string, pattern: string) {
  const tokens: string[] = []
  let source = ''
  let last = 0
  for (const match of pattern.matchAll(DATE_TOKENS)) {
    source += escapeRegExp(pattern.slice(last, match.index))
    const token = match[0]
    if (token.startsWith("'")) {
      source += escapeRegExp(token.slice(1, -1))
    } else {
      tokens.push(token)
      source += TOKEN_SOURCE[token] ?? ''
    }
    last = match.index + token.length
  }
  source += escapeRegExp(pattern.slice(last))

  const match = new RegExp(`^${source}$`).exec(value.trim())
  if (!match)
    return undefined
  const parts: Record<string, string> = {}
  // Keyed by the token's letter: y M d H h m s a.
  tokens.forEach((token, i) => (parts[token.charAt(0)] = match[i + 1] ?? ''))

  const year = Number(parts.y ?? 1970)
  const month = Number(parts.M ?? 1)
  const day = Number(parts.d ?? 1)
  const minutes = Number(parts.m ?? 0)
  const seconds = Number(parts.s ?? 0)
  let hours = Number(parts.H ?? 0)
  if (parts.h !== undefined) {
    const h12 = Number(parts.h)
    if (h12 < 1 || h12 > 12)
      return undefined
    hours = (h12 % 12) + (parts.a?.toUpperCase() === 'PM' ? 12 : 0)
  }
  if (hours > 23 || minutes > 59 || seconds > 59)
    return undefined

  const date = new Date(year, month - 1, day, hours, minutes, seconds)
  // Rejects 31/02 and friends, which Date would roll over into March.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const isPatternFormat = (format: DateValueFormat): format is string =>
  typeof format === 'string' && format !== 'date' && format !== 'iso' && format !== 'timestamp'

/** Date → the shape picked by `format`. */
export function formatDateValue(date: Date | undefined, format: DateValueFormat = 'date') {
  if (!date)
    return undefined
  if (typeof format === 'object')
    return format.format(date)
  if (format === 'date')
    return date
  if (format === 'iso')
    return date.toISOString()
  if (format === 'timestamp')
    return date.getTime()
  return formatDatePattern(date, format)
}

/** Any accepted value → Date (lenient: a Date, timestamp or ISO string works whatever the format). */
export function parseDateValue(value: unknown, format: DateValueFormat = 'date'): Date | undefined {
  if (value === undefined || value === null || value === '')
    return undefined
  let date: Date | undefined
  if (typeof format === 'object')
    date = format.parse(value)
  else if (value instanceof Date)
    date = value
  else if (typeof value === 'number')
    date = new Date(value)
  else if (typeof value === 'string')
    date = parseString(value, format)
  return date && !Number.isNaN(date.getTime()) ? date : undefined
}

function parseString(value: string, format: string) {
  const date = isPatternFormat(format) ? parseDatePattern(value, format) : undefined
  if (date)
    return date
  // '2026-10-14' alone is a local day (new Date() would read it as UTC midnight).
  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return parseDatePattern(value, 'yyyy-MM-dd')
  // Otherwise only trust ISO 8601; '10/14/2026' means different days in different locales.
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : undefined
}

/* ---------------------------------------------------------------------------
 * Time zones. Pickers work with 'wall-clock' Dates: local Date objects whose
 * fields (getHours()...) are what a clock in `timeZone` shows. Converting at
 * the edges keeps the calendar and time columns time-zone free.
 * ------------------------------------------------------------------------- */

const zoneFormatters = new Map<string, Intl.DateTimeFormat>()

/** Wall-clock time of `date` in `timeZone`, as a local Date carrying those fields. */
export function toZonedTime(date: Date, timeZone: string) {
  let formatter = zoneFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    zoneFormatters.set(timeZone, formatter)
  }
  const parts: Record<string, number> = {}
  for (const part of formatter.formatToParts(date))
    parts[part.type] = Number(part.value)
  const get = (type: string) => parts[type] ?? 0
  return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'), date.getMilliseconds())
}

/** The instant at which clocks in `timeZone` show the fields of `wall`. */
export function fromZonedTime(wall: Date, timeZone: string) {
  const asUtc = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
  const target = asUtc(wall)
  const offsetAt = (time: number) => asUtc(toZonedTime(new Date(time), timeZone)) - time
  // Second pass settles times next to a DST change.
  let time = target - offsetAt(target)
  time = target - offsetAt(time)
  return new Date(time)
}

/** Instant → wall clock in `timeZone` (identity without a time zone). */
export const toWallTime = (date: Date | undefined, timeZone?: string) =>
  date && timeZone ? toZonedTime(date, timeZone) : date

/** Wall clock in `timeZone` → instant (identity without a time zone). */
export const fromWallTime = (date: Date | undefined, timeZone?: string) =>
  date && timeZone ? fromZonedTime(date, timeZone) : date

/**
 * Picker value → the wall-clock Date it shows. Pattern values already are
 * wall-clock time in `timeZone`; Dates, ISO strings and timestamps are instants.
 */
export function parseWallValue(value: unknown, format: DateValueFormat = 'date', timeZone?: string) {
  const date = parseDateValue(value, format)
  return isPatternFormat(format) ? date : toWallTime(date, timeZone)
}

/** Wall-clock Date → the value the picker emits. */
export function formatWallValue(wall: Date | undefined, format: DateValueFormat = 'date', timeZone?: string) {
  return formatDateValue(isPatternFormat(format) ? wall : fromWallTime(wall, timeZone), format)
}
