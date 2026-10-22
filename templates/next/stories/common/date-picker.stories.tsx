import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ReactNode } from "react"

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  createRangePresets,
  type DateRange,
  type DateValueFormat,
} from "@/components/common/date-picker"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

/**
 * Popover + Calendar (react-day-picker). Values are `Date`s by default;
 * `valueFormat` switches to an ISO string, a timestamp or a pattern such as
 * "yyyy-MM-dd". The month and year dropdowns span minDate–maxDate (default
 * 100 years back, 10 ahead).
 */
const meta = {
  title: "Common/DatePicker",
  component: DatePicker,
  decorators: [(Story) => <div className="w-64"><Story /></div>],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/** The value under a picker, so each story shows what `onChange` emits. */
function Output({ value }: { value: unknown }) {
  const text =
    value === undefined
      ? "—"
      : value instanceof Date
        ? `Date: ${value.toISOString()}`
        : JSON.stringify(value, (_, v) => (v instanceof Date ? v.toISOString() : v))
  return <code className="text-xs break-all text-muted-foreground">{text}</code>
}

function Demo({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>
}

function DateDemo(props: Omit<React.ComponentProps<typeof DatePicker>, "value" | "onChange">) {
  const [value, setValue] = useState<Date | undefined>()
  return <DatePicker {...props} value={value} onChange={setValue} />
}

const today = () => new Date()
const inDays = (days: number) => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

export const Default: Story = { render: () => <DateDemo /> }

/** Only the next 30 days are selectable. */
export const MinMax: Story = {
  render: () => <DateDemo minDate={today()} maxDate={inDays(30)} placeholder="Next 30 days" />,
}

/** `disabledDates`: a list of days, or a test, e.g. weekends. */
export const DisabledDates: Story = {
  render: () => (
    <DateDemo
      placeholder="Weekdays only"
      disabledDates={(day) => day.getDay() === 0 || day.getDay() === 6}
    />
  ),
}

export const VietnameseFormat: Story = { render: () => <DateDemo locale="vi-VN" placeholder="Chọn ngày" /> }

/** `displayFormat` sets the shown text (default: the locale's format). */
export const DisplayFormat: Story = { render: () => <DateDemo displayFormat="yyyy-MM-dd" /> }

function EditableDemo() {
  const [value, setValue] = useState<Date | undefined>()
  return (
    <Demo>
      <DatePicker editable value={value} onChange={setValue} maxDate={today()} />
      <Output value={value} />
    </Demo>
  )
}

/**
 * `editable`: type "15102026" → 15/10/2026 (masked to `displayFormat`).
 * Enter / blur commits; an invalid or disabled day is reverted on blur.
 */
export const Editable: Story = { render: () => <EditableDemo /> }

export const Disabled: Story = { render: () => <DateDemo disabled /> }

export const InForm: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
      <DateDemo id="dob" aria-invalid maxDate={today()} />
      <FieldError>Please pick a date.</FieldError>
    </Field>
  ),
}

const formats: DateValueFormat[] = ["date", "iso", "timestamp", "yyyy-MM-dd", "dd/MM/yyyy HH:mm"]

function ValueFormatDemo() {
  const [values, setValues] = useState<Record<string, unknown>>({})
  return (
    <div className="flex w-80 flex-col gap-4">
      {formats.map((format) => {
        const key = String(format)
        const Picker = key.includes("HH") ? DateTimePicker : DatePicker
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <code className="text-xs font-medium">valueFormat=&quot;{key}&quot;</code>
            <Picker<string | number | Date>
              valueFormat={format}
              value={values[key] as string | number | Date | undefined}
              onChange={(value) => setValues((prev) => ({ ...prev, [key]: value }))}
            />
            <code className="text-xs text-muted-foreground">
              {values[key] === undefined ? "—" : `${typeof values[key]}: ${JSON.stringify(values[key])}`}
            </code>
          </div>
        )
      })}
    </div>
  )
}

/** The same pick, emitted in each `valueFormat` (a `{ format, parse }` codec works too). */
export const ValueFormat: Story = {
  decorators: [(Story) => <Story />],
  render: () => <ValueFormatDemo />,
}

function DateTimeDemo(props: Omit<React.ComponentProps<typeof DateTimePicker>, "value" | "onChange"> & { initial?: Date }) {
  const { initial, ...rest } = props
  const [value, setValue] = useState<Date | undefined>(initial)
  return (
    <Demo>
      <DateTimePicker {...rest} value={value} onChange={setValue} />
      <Output value={value} />
    </Demo>
  )
}

/** Day + hour / minute columns; changing one keeps the other. "Now" and "Done" in the footer. */
export const DateTime: Story = {
  render: () => <DateTimeDemo initial={new Date(2026, 9, 22, 14, 30)} minuteStep={15} />,
}

/**
 * `minTime` / `maxTime` every day (08:00–17:30 here), weekends disabled, and
 * `minDate={new Date()}`: today only from the current time on.
 */
export const WorkingHours: Story = {
  render: () => (
    <DateTimeDemo
      minDate={new Date()}
      minTime="08:00"
      maxTime="17:30"
      minuteStep={30}
      disabledDates={(day) => day.getDay() === 0 || day.getDay() === 6}
      placeholder="Book a slot"
    />
  ),
}

/** `hourCycle={12}` adds an AM/PM column; `withSeconds` a seconds column. */
export const TwelveHourWithSeconds: Story = {
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  render: () => <DateTimeDemo hourCycle={12} withSeconds secondStep={5} initial={new Date(2026, 9, 22, 21, 5, 30)} />,
}

/** Type the date and time; the mask follows `displayFormat` (default "dd/MM/yyyy HH:mm"). */
export const DateTimeEditable: Story = {
  render: () => <DateTimeDemo editable />,
}

function TimeZoneDemo() {
  const [value, setValue] = useState<Date | undefined>(new Date(Date.UTC(2026, 9, 22, 13, 0)))
  return (
    <div className="flex w-72 flex-col gap-3">
      {["Asia/Ho_Chi_Minh", "America/New_York", "Europe/London"].map((timeZone) => (
        <div key={timeZone} className="flex flex-col gap-1">
          <code className="text-xs font-medium">timeZone=&quot;{timeZone}&quot;</code>
          <DateTimePicker timeZone={timeZone} value={value} onChange={setValue} />
        </div>
      ))}
      <Output value={value} />
    </div>
  )
}

/**
 * `timeZone`: the same instant picked and shown in three zones. Picking
 * 09:00 in New York emits 13:00 UTC; pattern values are wall time in the zone.
 */
export const TimeZone: Story = {
  decorators: [(Story) => <Story />],
  render: () => <TimeZoneDemo />,
}

function RangeDemo(props: Omit<React.ComponentProps<typeof DateRangePicker<string | Date>>, "value" | "onChange">) {
  const [value, setValue] = useState<DateRange<string | Date>>()
  return (
    <Demo>
      <DateRangePicker<string | Date> {...props} value={value} onChange={setValue} />
      <Output value={value} />
    </Demo>
  )
}

const rangeDecorator: Story["decorators"] = [(Story) => <div className="w-72"><Story /></div>]

/** Start and end day over two months; the popover stays open while you pick. */
export const Range: Story = { decorators: rangeDecorator, render: () => <RangeDemo /> }

/** `{ from, to }` as "yyyy-MM-dd" strings, the usual API query shape. */
export const RangeAsStrings: Story = { decorators: rangeDecorator, render: () => <RangeDemo valueFormat="yyyy-MM-dd" /> }

/** Only the next 60 days, one month at a time. */
export const RangeMinMax: Story = {
  decorators: rangeDecorator,
  render: () => <RangeDemo minDate={today()} maxDate={inDays(60)} numberOfMonths={1} />,
}

/** `presets` (true = Today, Yesterday, Last 7 / 30 days, This / Last month). */
export const RangePresets: Story = { decorators: rangeDecorator, render: () => <RangeDemo presets /> }

/** Translated presets: `createRangePresets({ today: "Hôm nay", ... })`, or your own list. */
export const RangePresetsVietnamese: Story = {
  decorators: rangeDecorator,
  render: () => (
    <RangeDemo
      locale="vi-VN"
      placeholder="Chọn khoảng ngày"
      presets={createRangePresets({
        today: "Hôm nay",
        yesterday: "Hôm qua",
        last7: "7 ngày qua",
        last30: "30 ngày qua",
        thisMonth: "Tháng này",
        lastMonth: "Tháng trước",
      })}
    />
  ),
}

/** `maxDays={7}`: after the first click, days more than a week away are disabled. */
export const RangeMaxDays: Story = { decorators: rangeDecorator, render: () => <RangeDemo maxDays={7} /> }

/** Type "01102026 15102026" → 01/10/2026 – 15/10/2026. */
export const RangeEditable: Story = { decorators: rangeDecorator, render: () => <RangeDemo editable /> }

function DateTimeRangeDemo(props: Omit<React.ComponentProps<typeof DateTimeRangePicker<string | Date>>, "value" | "onChange">) {
  const [value, setValue] = useState<DateRange<string | Date>>()
  return (
    <Demo>
      <DateTimeRangePicker<string | Date> {...props} value={value} onChange={setValue} />
      <Output value={value} />
    </Demo>
  )
}

/**
 * Range + Start / End time columns. The end defaults to 23:59; on the same
 * day the end can't be before the start. Presets work here too.
 */
export const DateTimeRange: Story = {
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  render: () => <DateTimeRangeDemo minuteStep={15} presets />,
}

/** Working hours and a 3-day limit, emitted as "yyyy-MM-dd HH:mm" strings. */
export const DateTimeRangeRules: Story = {
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  render: () => (
    <DateTimeRangeDemo minTime="09:00" maxTime="18:00" minuteStep={30} maxDays={3} valueFormat="yyyy-MM-dd HH:mm" />
  ),
}
