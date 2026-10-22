import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { DateValueFormat } from '@/components/common/date-value'
import DatePicker from '@/components/common/DatePicker.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

/**
 * Popover + Calendar (Reka UI). `v-model` is a `Date` by default;
 * `value-format` switches to an ISO string, a timestamp or a pattern such as
 * "yyyy-MM-dd". The month and year dropdowns span minDate–maxDate (default
 * 100 years back, 10 ahead).
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

const formats: DateValueFormat[] = ['date', 'iso', 'timestamp', 'yyyy-MM-dd', 'dd/MM/yyyy HH:mm']

/** The same pick, emitted in each `value-format` (a `{ format, parse }` codec works too). */
export const ValueFormat: Story = {
  render: () => ({
    components: { DatePicker, DateTimePicker },
    setup: () => ({ formats, values: ref<Record<string, unknown>>({}), DatePicker, DateTimePicker }),
    template: `
      <div class="flex w-80 flex-col gap-4">
        <div v-for="format in formats" :key="format" class="flex flex-col gap-1.5">
          <code class="text-xs font-medium">value-format="{{ format }}"</code>
          <component
            :is="String(format).includes('HH') ? DateTimePicker : DatePicker"
            v-model="values[format]"
            :value-format="format"
          />
          <code class="text-xs text-muted-foreground">
            {{ values[format] === undefined ? '—' : \`\${typeof values[format]}: \${JSON.stringify(values[format])}\` }}
          </code>
        </div>
      </div>
    `,
  }),
}

function rangeStory(props: Record<string, unknown> = {}): Story {
  return {
    render: () => ({
      components: { DateRangePicker },
      setup: () => ({ props, value: ref() }),
      template: `
        <div class="flex w-72 flex-col gap-2">
          <DateRangePicker v-bind="props" v-model="value" />
          <code class="text-xs text-muted-foreground">{{ value ? JSON.stringify(value) : '—' }}</code>
        </div>
      `,
    }),
  }
}

/** Start and end day over two months; the popover stays open while you pick. */
export const Range: Story = rangeStory()

/** `{ from, to }` as "yyyy-MM-dd" strings, the usual API query shape. */
export const RangeAsStrings: Story = rangeStory({ valueFormat: 'yyyy-MM-dd' })

/** Only the next 60 days, one month at a time. */
export const RangeMinMax: Story = rangeStory({
  minDate: today,
  maxDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60),
  numberOfMonths: 1,
})
