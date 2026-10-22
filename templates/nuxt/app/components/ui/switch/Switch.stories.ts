import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '.'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  argTypes: { size: { control: 'select', options: ['sm', 'default'] } },
  render: args => ({
    components: { Switch },
    setup: () => ({ args }),
    template: '<Switch v-bind="args" aria-label="Toggle" />',
  }),
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => ({
    components: { Switch },
    template: `
      <div class="flex items-center gap-4">
        <Switch aria-label="Off" />
        <Switch aria-label="On" :default-value="true" />
        <Switch aria-label="Small" size="sm" :default-value="true" />
        <Switch aria-label="Disabled" disabled />
      </div>
    `,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { Switch, Field, FieldContent, FieldDescription, FieldLabel },
    template: `
      <Field orientation="horizontal" class="w-80">
        <FieldContent>
          <FieldLabel for="airplane">Airplane mode</FieldLabel>
          <FieldDescription>Disable all wireless connections.</FieldDescription>
        </FieldContent>
        <Switch id="airplane" />
      </Field>
    `,
  }),
}
