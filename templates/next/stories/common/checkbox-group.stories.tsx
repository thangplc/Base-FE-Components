import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { CheckboxGroup } from "@/components/common/checkbox-group"

const permissions = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "delete", label: "Delete" },
  { value: "admin", label: "Admin", disabled: true },
]

/**
 * Checkboxes with a tri-state "select all": checked when all enabled options
 * are selected, a dash when only some are. Disabled options keep their state.
 */
const meta = {
  title: "Common/CheckboxGroup",
  component: CheckboxGroup,
  args: { options: permissions, legend: "Permissions", selectAll: "All permissions", defaultValue: ["read"] },
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const SelectAll: Story = {}

export const WithDescriptions: Story = {
  args: {
    legend: "Notifications",
    selectAll: true,
    defaultValue: [],
    options: [
      { value: "email", label: "Email", description: "Daily digest and mentions." },
      { value: "push", label: "Push", description: "Instant alerts on your phone." },
      { value: "sms", label: "SMS", description: "Only for security events." },
    ],
  },
}

export const Horizontal: Story = {
  args: { orientation: "horizontal", selectAll: false },
}

function ControlledDemo() {
  const [value, setValue] = useState<string[]>(["write"])
  return (
    <div className="flex flex-col gap-3">
      <CheckboxGroup options={permissions} selectAll value={value} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledDemo /> }

function SeparatorDemo() {
  const [value, setValue] = useState("read,write")
  return (
    <div className="flex flex-col gap-3">
      <CheckboxGroup options={permissions} selectAll separator="," value={value} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `separator=","`: the value is one string ("read,write") instead of an array. */
export const JoinedString: Story = { render: () => <SeparatorDemo /> }
