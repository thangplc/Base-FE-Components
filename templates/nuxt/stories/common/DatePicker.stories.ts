import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

/**
 * Popover + Calendar (Reka UI). `v-model` is a plain `Date`; the month and
 * year dropdowns span minDate–maxDate (default 100 years back, 10 ahead).
 */
const meta = {
  title: 'Common/DatePicker',
  component: DatePicker,
  render: args => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<Date>() }),
    template: '<div class="w-64"><DatePicker v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const today = new Date()

/** Only the next 30 days are selectable. */
export const MinMax: Story = {
  args: {
    minDate: today,
    maxDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
    placeholder: 'Next 30 days',
  },
}

export const VietnameseFormat: Story = { args: { locale: 'vi-VN', placeholder: 'Chọn ngày' } }

export const Disabled: Story = { args: { disabled: true } }

export const InForm: Story = {
  render: () => ({
    components: { DatePicker, Field, FieldError, FieldLabel },
    setup: () => ({ value: ref<Date>(), today }),
    template: `
      <div class="w-64">
        <Field data-invalid="true">
          <FieldLabel for="dob">Date of birth</FieldLabel>
          <DatePicker id="dob" v-model="value" invalid :max-date="today" />
          <FieldError>Please pick a date.</FieldError>
        </Field>
      </div>
    `,
  }),
}

/** Day + time (HH:mm); changing one keeps the other. */
export const DateTime: Story = {
  render: () => ({
    components: { DateTimePicker },
    setup: () => ({ value: ref<Date | undefined>(new Date(2026, 9, 22, 14, 30)) }),
    template: `
      <div class="flex w-64 flex-col gap-2">
        <DateTimePicker v-model="value" :minute-step="15" />
        <code class="text-xs text-muted-foreground">{{ value?.toISOString() ?? '—' }}</code>
      </div>
    `,
  }),
}
