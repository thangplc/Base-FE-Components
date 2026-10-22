import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Layout primitives for forms: Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSet. The Form* wrappers in common/form are built on these.",
      },
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <form className="w-96">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Payment method</FieldLegend>
          <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="card-name">Name on card</FieldLabel>
              <Input id="card-name" placeholder="Jane Doe" />
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="card-number">Card number</FieldLabel>
              <Input id="card-number" defaultValue="1234" aria-invalid />
              <FieldError>Card number must be 16 digits.</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Billing</FieldLegend>
          <Field orientation="horizontal">
            <Checkbox id="same" defaultChecked />
            <FieldLabel htmlFor="same" className="font-normal">Same as shipping address</FieldLabel>
          </Field>
          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea id="notes" placeholder="Optional" />
          </Field>
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outline">Cancel</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
}

export const Responsive: Story = {
  render: () => (
    <FieldGroup className="w-[36rem]">
      <Field orientation="responsive">
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input id="username" placeholder="janedoe" />
      </Field>
      <Field orientation="responsive">
        <FieldLabel htmlFor="website">Website</FieldLabel>
        <Input id="website" placeholder="https://" />
      </Field>
    </FieldGroup>
  ),
}
