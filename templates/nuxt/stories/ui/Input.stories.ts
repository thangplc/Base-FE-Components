import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'UI/Input',
  component: Input,
  decorators: [() => ({ template: '<div class="w-72"><story /></div>' })],
  render: args => ({
    components: { Input },
    setup: () => ({ args }),
    template: '<Input v-bind="args" placeholder="Email" type="email" />',
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="flex flex-col gap-3">
        <Input placeholder="Default" />
        <Input placeholder="Disabled" disabled />
        <Input model-value="not-an-email" aria-invalid="true" />
        <Input type="file" />
      </div>
    `,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { Input, Field, FieldLabel, FieldDescription },
    template: `
      <Field>
        <FieldLabel for="email">Email</FieldLabel>
        <Input id="email" type="email" placeholder="m@example.com" />
        <FieldDescription>We will never share your email.</FieldDescription>
      </Field>
    `,
  }),
}

/** maxlength / minlength show a counter at the end of the field (red below min / at max). */
export const CharacterCount: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="flex flex-col gap-3">
        <Input placeholder="Username (max 20)" :maxlength="20" default-value="janedoe" />
        <Input placeholder="Password (min 8)" type="password" :minlength="8" default-value="abc" />
        <Input placeholder="Code (4–6)" :minlength="4" :maxlength="6" />
      </div>
    `,
  }),
}
