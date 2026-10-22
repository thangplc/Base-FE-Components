import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "./field"
import { RadioGroup, RadioGroupItem } from "./radio-group"

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      {["default", "comfortable", "compact"].map((value) => (
        <Field key={value} orientation="horizontal">
          <RadioGroupItem value={value} id={`r-${value}`} />
          <FieldLabel htmlFor={`r-${value}`} className="font-normal capitalize">{value}</FieldLabel>
        </Field>
      ))}
    </RadioGroup>
  ),
}

export const WithDescriptions: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend variant="label">Plan</FieldLegend>
      <RadioGroup defaultValue="pro">
        {[
          { value: "free", label: "Free", desc: "For personal projects." },
          { value: "pro", label: "Pro", desc: "For teams up to 10 people." },
          { value: "enterprise", label: "Enterprise", desc: "Contact sales.", disabled: true },
        ].map((plan) => (
          <Field key={plan.value} orientation="horizontal" data-disabled={plan.disabled}>
            <RadioGroupItem value={plan.value} id={`plan-${plan.value}`} disabled={plan.disabled} />
            <FieldContent>
              <FieldLabel htmlFor={`plan-${plan.value}`}>{plan.label}</FieldLabel>
              <FieldDescription>{plan.desc}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
}
