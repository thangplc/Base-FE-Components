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
 * - `"date"` (default): a JS `Date`
 * - `"iso"`: ISO 8601 string in UTC (`Date#toISOString`)
 * - `"timestamp"`: milliseconds since epoch
 * - a pattern in local time, e.g. `"yyyy-MM-dd"` or `"dd/MM/yyyy HH:mm"`
 *   (tokens: yyyy MM M dd d HH H mm ss; quote literal text: `"yyyy-MM-dd'T'HH:mm"`)
 * - a `{ format, parse }` codec
 *
 * For date-only fields prefer a pattern like `"yyyy-MM-dd"`: `"iso"` turns
 * local midnight into UTC, which can show the previous day.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DateValueFormat = "date" | "iso" | "timestamp" | (string & {}) | DateCodec<any>

const TOKENS = /'[^']*'|yyyy|MM|dd|HH|mm|ss|M|d|H/g

const pad = (n: number, length = 2) => String(n).padStart(length, "0")

/** Format a date with a pattern such as "dd/MM/yyyy HH:mm" (local time). */
export function formatDatePattern(date: Date, pattern: string) {
  const parts: Record<string, string> = {
    yyyy: pad(date.getFullYear(), 4),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    dd: pad(date.getDate()),
    d: String(date.getDate()),
    HH: pad(date.getHours()),
    H: String(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }
  return pattern.replace(TOKENS, (token) => (token.startsWith("'") ? token.slice(1, -1) : parts[token]))
}

/** Parse a string written with `pattern`; undefined if it doesn't match or isn't a real date. */
export function parseDatePattern(value: string, pattern: string) {
  const order: string[] = []
  let source = ""
  let last = 0
  for (const match of pattern.matchAll(TOKENS)) {
    source += escapeRegExp(pattern.slice(last, match.index))
    const token = match[0]
    if (token.startsWith("'")) {
      source += escapeRegExp(token.slice(1, -1))
    } else {
      order.push(token[0])
      source += token === "yyyy" ? "(\\d{4})" : token.length === 2 ? "(\\d{2})" : "(\\d{1,2})"
    }
    last = match.index + token.length
  }
  source += escapeRegExp(pattern.slice(last))

  const match = new RegExp(`^${source}$`).exec(value.trim())
  if (!match) return undefined
  const get = (key: string, fallback: number) => {
    const index = order.indexOf(key)
    return index === -1 ? fallback : Number(match[index + 1])
  }
  const [year, month, day] = [get("y", 1970), get("M", 1), get("d", 1)]
  const date = new Date(year, month - 1, day, get("H", 0), get("m", 0), get("s", 0))
  // Rejects 31/02 and friends, which Date would roll over into March.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Date → the shape picked by `format`. */
export function formatDateValue(date: Date | undefined, format: DateValueFormat = "date") {
  if (!date) return undefined
  if (typeof format === "object") return format.format(date)
  if (format === "date") return date
  if (format === "iso") return date.toISOString()
  if (format === "timestamp") return date.getTime()
  return formatDatePattern(date, format)
}

/** Any accepted value → Date (lenient: a Date, timestamp or ISO string works whatever the format). */
export function parseDateValue(value: unknown, format: DateValueFormat = "date"): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined
  let date: Date | undefined
  if (typeof format === "object") date = format.parse(value)
  else if (value instanceof Date) date = value
  else if (typeof value === "number") date = new Date(value)
  else if (typeof value === "string") date = parseString(value, format)
  return date && !Number.isNaN(date.getTime()) ? date : undefined
}

function parseString(value: string, format: string) {
  const isPattern = format !== "date" && format !== "iso" && format !== "timestamp"
  const date = isPattern ? parseDatePattern(value, format) : undefined
  if (date) return date
  // "2026-10-14" alone is a local day (new Date() would read it as UTC midnight).
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDatePattern(value, "yyyy-MM-dd")
  // Otherwise only trust ISO 8601; "10/14/2026" means different days in different locales.
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : undefined
}
