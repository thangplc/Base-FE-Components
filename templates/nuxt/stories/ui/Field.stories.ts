import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'

const components = {
  Button, Checkbox, Input, Textarea,
  Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet,
}

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    docs: {
      description: {
        component: 'Layout primitives for forms: Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSet. The Form* wrappers in common/form are built on these.',
      },
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <form class="w-96">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment method</FieldLegend>
            <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="card-name">Name on card</FieldLabel>
                <Input id="card-name" placeholder="Jane Doe" />
              </Field>
              <Field data-invalid="true">
                <FieldLabel for="card-number">Card number</FieldLabel>
                <Input id="card-number" model-value="1234" aria-invalid="true" />
                <FieldError>Card number must be 16 digits.</FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing</FieldLegend>
            <Field orientation="horizontal">
              <Checkbox id="same" :default-value="true" />
              <FieldLabel for="same" class="font-normal">Same as shipping address</FieldLabel>
            </Field>
            <Field>
              <FieldLabel for="notes">Notes</FieldLabel>
              <Textarea id="notes" placeholder="Optional" />
            </Field>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </Field>
        </FieldGroup>
      </form>
    `,
  }),
}

export const Responsive: Story = {
  render: () => ({
    components,
    template: `
      <FieldGroup class="w-[36rem]">
        <Field orientation="responsive">
          <FieldLabel for="username">Username</FieldLabel>
          <Input id="username" placeholder="janedoe" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel for="website">Website</FieldLabel>
          <Input id="website" placeholder="https://" />
        </Field>
      </FieldGroup>
    `,
  }),
}
