import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { DatePicker, DateTimePicker } from "@/components/common/date-picker"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

/**
 * Popover + Calendar (react-day-picker). Values are plain `Date`s; the month
 * and year dropdowns span minDate–maxDate (default 100 years back, 10 ahead).
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
