import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  argTypes: {
    checked: { control: "select", options: [true, false, "indeterminate"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" checked="indeterminate" />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Invalid" aria-invalid />
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-80">
      <Checkbox id="marketing" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="marketing">Marketing emails</FieldLabel>
        <FieldDescription>Receive emails about new products and features.</FieldDescription>
      </FieldContent>
    </Field>
  ),
}

export const Group: Story = {
  render: () => (
    <FieldSet className="w-72">
      <FieldLegend variant="label">Show on desktop</FieldLegend>
      <FieldGroup data-slot="checkbox-group">
        {["Hard disks", "External disks", "CDs, DVDs", "Connected servers"].map((item, i) => (
          <Field key={item} orientation="horizontal">
            <Checkbox id={`item-${i}`} defaultChecked={i < 2} />
            <FieldLabel htmlFor={`item-${i}`} className="font-normal">{item}</FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
}
