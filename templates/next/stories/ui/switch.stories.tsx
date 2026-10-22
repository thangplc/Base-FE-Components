import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

const meta = {
  title: "UI/Switch",
  component: Switch,
  argTypes: {
    size: { control: "select", options: ["sm", "default"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Small" size="sm" defaultChecked />
      <Switch aria-label="Disabled" disabled />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-80">
      <FieldContent>
        <FieldLabel htmlFor="airplane">Airplane mode</FieldLabel>
        <FieldDescription>Disable all wireless connections.</FieldDescription>
      </FieldContent>
      <Switch id="airplane" />
    </Field>
  ),
}
