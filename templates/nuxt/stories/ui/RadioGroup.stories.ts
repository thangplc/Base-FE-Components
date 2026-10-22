import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem, Field, FieldLabel },
    setup: () => ({ options: ['default', 'comfortable', 'compact'] }),
    template: `
      <RadioGroup default-value="comfortable">
        <Field v-for="value in options" :key="value" orientation="horizontal">
          <RadioGroupItem :id="'r-' + value" :value="value" />
          <FieldLabel :for="'r-' + value" class="font-normal capitalize">{{ value }}</FieldLabel>
        </Field>
      </RadioGroup>
    `,
  }),
}

export const WithDescriptions: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem, Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet },
    setup: () => ({
      plans: [
        { value: 'free', label: 'Free', desc: 'For personal projects.' },
        { value: 'pro', label: 'Pro', desc: 'For teams up to 10 people.' },
        { value: 'enterprise', label: 'Enterprise', desc: 'Contact sales.', disabled: true },
      ],
    }),
    template: `
      <FieldSet class="w-80">
        <FieldLegend variant="label">Plan</FieldLegend>
        <RadioGroup default-value="pro">
          <Field v-for="plan in plans" :key="plan.value" orientation="horizontal" :data-disabled="plan.disabled">
            <RadioGroupItem :id="'plan-' + plan.value" :value="plan.value" :disabled="plan.disabled" />
            <FieldContent>
              <FieldLabel :for="'plan-' + plan.value">{{ plan.label }}</FieldLabel>
              <FieldDescription>{{ plan.desc }}</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
      </FieldSet>
    `,
  }),
}
