import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
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

function DateDemo(props: Omit<React.ComponentProps<typeof DatePicker>, "value" | "onChange">) {
  const [value, setValue] = useState<Date | undefined>()
  return <DatePicker {...props} value={value} onChange={setValue} />
}

export const Default: Story = { render: () => <DateDemo /> }

/** Only the next 30 days are selectable. */
export const MinMax: Story = {
  render: () => {
    const today = new Date()
    const in30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
    return <DateDemo minDate={today} maxDate={in30} placeholder="Next 30 days" />
  },
}

export const VietnameseFormat: Story = { render: () => <DateDemo locale="vi-VN" placeholder="Chọn ngày" /> }

export const Disabled: Story = { render: () => <DateDemo disabled /> }

export const InForm: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
      <DateDemo id="dob" aria-invalid maxDate={new Date()} />
      <FieldError>Please pick a date.</FieldError>
    </Field>
  ),
}

function DateTimeDemo() {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 9, 22, 14, 30))
  return (
    <div className="flex flex-col gap-2">
      <DateTimePicker value={value} onChange={setValue} minuteStep={15} />
      <code className="text-xs text-muted-foreground">{value?.toISOString() ?? "—"}</code>
    </div>
  )
}

/** Day + time (HH:mm); changing one keeps the other. */
export const DateTime: Story = { render: () => <DateTimeDemo /> }

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

function RangeDemo({ valueFormat }: { valueFormat?: DateValueFormat }) {
  const [value, setValue] = useState<DateRange<string | Date>>()
  return (
    <div className="flex flex-col gap-2">
      <DateRangePicker<string | Date> value={value} onChange={setValue} valueFormat={valueFormat} />
      <code className="text-xs text-muted-foreground">{value ? JSON.stringify(value) : "—"}</code>
    </div>
  )
}

/** Start and end day over two months; the popover stays open while you pick. */
export const Range: Story = {
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  render: () => <RangeDemo />,
}

/** `{ from, to }` as "yyyy-MM-dd" strings, the usual API query shape. */
export const RangeAsStrings: Story = {
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  render: () => <RangeDemo valueFormat="yyyy-MM-dd" />,
}

/** Only the next 60 days, one month at a time. */
export const RangeMinMax: Story = {
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  render: () => {
    const today = new Date()
    return (
      <DateRangePicker
        minDate={today}
        maxDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60)}
        numberOfMonths={1}
      />
    )
  },
}
