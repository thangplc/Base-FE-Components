import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DateValueFormat } from '@/components/common/date-picker'
import { defineComponent, h, ref } from 'vue'
import {
  createRangePresets,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
} from '@/components/common/date-picker'
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
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/** The value under a picker, so each story shows what `v-model` holds. */
const Output = defineComponent({
  props: { value: { type: null, default: undefined } },
  setup: props => () => h('code', { class: 'text-xs break-all text-muted-foreground' }, props.value === undefined
    ? '—'
    : props.value instanceof Date
      ? `Date: ${props.value.toISOString()}`
      : JSON.stringify(props.value, (_, v) => (v instanceof Date ? v.toISOString() : v))),
})

const today = () => new Date()
function inDays(days: number) {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}
const weekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6

/** A picker + its value; `props` go to the picker. */
function story(picker: unknown, props: Record<string, unknown> = {}, { width = 'w-64', initial }: { width?: string, initial?: unknown } = {}): Story {
  return {
    render: () => ({
      components: { Picker: picker as typeof DatePicker, Output },
      setup: () => ({ props, value: ref(initial), width }),
      template: `
        <div :class="['flex flex-col gap-2', width]">
          <Picker v-bind="props" v-model="value" />
          <Output :value="value" />
        </div>
      `,
    }),
  }
}

export const Default: Story = story(DatePicker)

/** Only the next 30 days are selectable. */
export const MinMax: Story = story(DatePicker, { minDate: today(), maxDate: inDays(30), placeholder: 'Next 30 days' })

/** `disabled-dates`: a list of days, or a test, e.g. weekends. */
export const DisabledDates: Story = story(DatePicker, { placeholder: 'Weekdays only', disabledDates: weekend })

export const VietnameseFormat: Story = story(DatePicker, { locale: 'vi-VN', placeholder: 'Chọn ngày' })

/** `display-format` sets the shown text (default: the locale's format). */
export const DisplayFormat: Story = story(DatePicker, { displayFormat: 'yyyy-MM-dd' })

/**
 * `editable`: type "15102026" → 15/10/2026 (masked to `display-format`).
 * Enter / blur commits; an invalid or disabled day is reverted on blur.
 */
export const Editable: Story = story(DatePicker, { editable: true, maxDate: today() })

export const Disabled: Story = story(DatePicker, { disabled: true })

export const InForm: Story = {
  render: () => ({
    components: { DatePicker, Field, FieldError, FieldLabel },
    setup: () => ({ value: ref<Date>(), today: today() }),
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

/** Day + hour / minute columns; changing one keeps the other. "Now" and "Done" in the footer. */
export const DateTime: Story = story(DateTimePicker, { minuteStep: 15 }, { initial: new Date(2026, 9, 22, 14, 30) })

/**
 * `min-time` / `max-time` every day (08:00–17:30 here), weekends disabled, and
 * `:min-date="new Date()"`: today only from the current time on.
 */
export const WorkingHours: Story = story(DateTimePicker, {
  minDate: new Date(),
  minTime: '08:00',
  maxTime: '17:30',
  minuteStep: 30,
  disabledDates: weekend,
  placeholder: 'Book a slot',
})

/** `:hour-cycle="12"` adds an AM/PM column; `with-seconds` a seconds column. */
export const TwelveHourWithSeconds: Story = story(
  DateTimePicker,
  { hourCycle: 12, withSeconds: true, secondStep: 5 },
  { width: 'w-72', initial: new Date(2026, 9, 22, 21, 5, 30) },
)

/** Type the date and time; the mask follows `display-format` (default "dd/MM/yyyy HH:mm"). */
export const DateTimeEditable: Story = story(DateTimePicker, { editable: true })

/**
 * `time-zone`: the same instant picked and shown in three zones. Picking
 * 09:00 in New York emits 13:00 UTC; pattern values are wall time in the zone.
 */
export const TimeZone: Story = {
  render: () => ({
    components: { DateTimePicker, Output },
    setup: () => ({
      zones: ['Asia/Ho_Chi_Minh', 'America/New_York', 'Europe/London'],
      value: ref<Date | undefined>(new Date(Date.UTC(2026, 9, 22, 13, 0))),
    }),
    template: `
      <div class="flex w-72 flex-col gap-3">
        <div v-for="zone in zones" :key="zone" class="flex flex-col gap-1">
          <code class="text-xs font-medium">time-zone="{{ zone }}"</code>
          <DateTimePicker v-model="value" :time-zone="zone" />
        </div>
        <Output :value="value" />
      </div>
    `,
  }),
}

/** Start and end day over two months; the popover stays open while you pick. */
export const Range: Story = story(DateRangePicker, {}, { width: 'w-72' })

/** `{ from, to }` as "yyyy-MM-dd" strings, the usual API query shape. */
export const RangeAsStrings: Story = story(DateRangePicker, { valueFormat: 'yyyy-MM-dd' }, { width: 'w-72' })

/** Only the next 60 days, one month at a time. */
export const RangeMinMax: Story = story(DateRangePicker, { minDate: today(), maxDate: inDays(60), numberOfMonths: 1 }, { width: 'w-72' })

/** `presets` (true = Today, Yesterday, Last 7 / 30 days, This / Last month). */
export const RangePresets: Story = story(DateRangePicker, { presets: true }, { width: 'w-72' })

/** Translated presets: `createRangePresets({ today: 'Hôm nay', ... })`, or your own list. */
export const RangePresetsVietnamese: Story = story(DateRangePicker, {
  locale: 'vi-VN',
  placeholder: 'Chọn khoảng ngày',
  presets: createRangePresets({
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    last7: '7 ngày qua',
    last30: '30 ngày qua',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
  }),
}, { width: 'w-72' })

/** `:max-days="7"`: after the first click, days more than a week away are disabled. */
export const RangeMaxDays: Story = story(DateRangePicker, { maxDays: 7 }, { width: 'w-72' })

/** Type "01102026 15102026" → 01/10/2026 – 15/10/2026. */
export const RangeEditable: Story = story(DateRangePicker, { editable: true }, { width: 'w-72' })

/**
 * Range + Start / End time columns. The end defaults to 23:59; on the same
 * day the end can't be before the start. Presets work here too.
 */
export const DateTimeRange: Story = story(DateTimeRangePicker, { minuteStep: 15, presets: true }, { width: 'w-80' })

/** Working hours and a 3-day limit, emitted as "yyyy-MM-dd HH:mm" strings. */
export const DateTimeRangeRules: Story = story(
  DateTimeRangePicker,
  { minTime: '09:00', maxTime: '18:00', minuteStep: 30, maxDays: 3, valueFormat: 'yyyy-MM-dd HH:mm' },
  { width: 'w-80' },
)
