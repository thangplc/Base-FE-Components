import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Checkbox },
    template: '<Checkbox aria-label="Accept" />',
  }),
}

export const States: Story = {
  render: () => ({
    components: { Checkbox },
    template: `
      <div class="flex items-center gap-4">
        <Checkbox aria-label="Unchecked" />
        <Checkbox aria-label="Checked" :default-value="true" />
        <Checkbox aria-label="Indeterminate" model-value="indeterminate" />
        <Checkbox aria-label="Disabled" disabled />
        <Checkbox aria-label="Invalid" aria-invalid="true" />
      </div>
    `,
  }),
}

export const WithDescription: Story = {
  render: () => ({
    components: { Checkbox, Field, FieldContent, FieldDescription, FieldLabel },
    template: `
      <Field orientation="horizontal" class="w-80">
        <Checkbox id="marketing" :default-value="true" />
        <FieldContent>
          <FieldLabel for="marketing">Marketing emails</FieldLabel>
          <FieldDescription>Receive emails about new products and features.</FieldDescription>
        </FieldContent>
      </Field>
    `,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { Checkbox, Field, FieldGroup, FieldLabel, FieldLegend, FieldSet },
    setup: () => ({ items: ['Hard disks', 'External disks', 'CDs, DVDs', 'Connected servers'] }),
    template: `
      <FieldSet class="w-72">
        <FieldLegend variant="label">Show on desktop</FieldLegend>
        <FieldGroup data-slot="checkbox-group">
          <Field v-for="(item, i) in items" :key="item" orientation="horizontal">
            <Checkbox :id="'item-' + i" :default-value="i < 2" />
            <FieldLabel :for="'item-' + i" class="font-normal">{{ item }}</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    `,
  }),
}
