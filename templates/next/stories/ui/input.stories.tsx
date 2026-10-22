import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const meta = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Email", type: "email" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number", "file", "date"] },
    disabled: { control: "boolean" },
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }

export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "not-an-email" } }

export const File: Story = { args: { type: "file", placeholder: undefined } }

export const WithLabel: Story = {
  render: (args) => (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" {...args} />
      <FieldDescription>We will never share your email.</FieldDescription>
    </Field>
  ),
}

/** maxLength / minLength show a counter at the end of the field (red below min / at max). */
export const CharacterCount: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input placeholder="Username (max 20)" maxLength={20} defaultValue="janedoe" />
      <Input placeholder="Password (min 8)" type="password" minLength={8} defaultValue="abc" />
      <Input placeholder="Code (4–6)" minLength={4} maxLength={6} />
    </div>
  ),
}
