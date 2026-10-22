import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Field, FieldDescription, FieldLabel } from "./field"
import { Input } from "./input"

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
