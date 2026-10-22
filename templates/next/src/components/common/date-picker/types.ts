import type { Ref } from "react"

import type { DateRangePreset, DisabledDates, PickerLabels, TimeOptions } from "./date-time"
import type { DateValueFormat } from "./date-value"

/** Props shared by DatePicker, DateTimePicker, DateRangePicker and DateTimeRangePicker. */
export type PickerBaseProps = {
  placeholder?: string
  /** Earliest / latest selectable moment (whole days for the calendar, the time on their own day). */
  minDate?: Date
  maxDate?: Date
  /** Days that can't be picked: a list, or a test such as `(d) => d.getDay() === 0`. */
  disabledDates?: DisabledDates
  disabled?: boolean
  /** Locale for the displayed value and the first day of the week (default "en-GB"). */
  locale?: string
  /** Show an × to clear the value. */
  clearable?: boolean
  /**
   * Shape of `value` / `onChange`: "date" (default), "iso", "timestamp",
   * a pattern like "yyyy-MM-dd", or a `{ format, parse }` codec.
   */
  valueFormat?: DateValueFormat
  /** Pattern for the shown text, e.g. "dd/MM/yyyy HH:mm" (default: the locale's format). */
  displayFormat?: string
  /** Let the user type the value (masked to `displayFormat`, default "dd/MM/yyyy[ HH:mm]"). */
  editable?: boolean
  /**
   * IANA time zone the user picks in, e.g. "Asia/Ho_Chi_Minh" (default: the
   * browser's). Dates / ISO / timestamps stay instants; patterns are wall time there.
   */
  timeZone?: string
  /** Texts inside the popover (Now, Done, Start, End...). */
  labels?: Partial<PickerLabels>
  id?: string
  className?: string
  "aria-invalid"?: boolean
  /** The trigger (react-hook-form focuses it on a validation error). */
  ref?: Ref<HTMLElement>
}

/** Time props of DateTimePicker and DateTimeRangePicker. */
export type PickerTimeProps = TimeOptions & {
  /** Minutes between options in the minute column (default 1). */
  minuteStep?: number
  /** Seconds between options in the seconds column (default 1). */
  secondStep?: number
  /** Earliest / latest time on every day, "HH:mm" or "HH:mm:ss" (e.g. working hours). */
  minTime?: string
  maxTime?: string
}

/** Range props of DateRangePicker and DateTimeRangePicker. */
export type PickerRangeProps = {
  /** Months shown side by side (they stack on small screens). */
  numberOfMonths?: number
  /** Longest range in days, counting both ends. */
  maxDays?: number
  /** Shortcuts on the left: `true` for Today, Last 7 days, This month..., or your own list. */
  presets?: boolean | DateRangePreset[]
}
