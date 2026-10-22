import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CheckIcon } from '@lucide/vue'
import { onBeforeUnmount, ref } from 'vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import ProgressCircle from '@/components/common/ProgressCircle.vue'

/** SVG ring: value in the middle, variants, sizes, a gauge gap and an indeterminate spin. */
const meta = {
  title: 'Common/ProgressCircle',
  component: ProgressCircle,
  args: { value: 42 },
} satisfies Meta<typeof ProgressCircle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: args => ({
    components: { ProgressCircle },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-4">
        <ProgressCircle v-bind="args" size="sm" />
        <ProgressCircle v-bind="args" />
        <ProgressCircle v-bind="args" size="lg" />
        <ProgressCircle v-bind="args" :size="128" :stroke-width="10" />
      </div>
    `,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { ProgressCircle, CheckIcon },
    template: `
      <div class="flex items-center gap-4">
        <ProgressCircle :value="42" />
        <ProgressCircle :value="100" variant="success"><CheckIcon class="size-6 text-success" /></ProgressCircle>
        <ProgressCircle :value="75" variant="warning" />
        <ProgressCircle :value="90" variant="destructive" />
      </div>
    `,
  }),
}

/** `:gap-degree="75"`: a gauge open at the bottom. */
export const Dashboard: Story = { args: { value: 68, size: 'lg', gapDegree: 75 } }

/** `line-cap="butt"` for square ends; `format-value` for any text. */
export const CustomValue: Story = {
  args: { value: 7.4, max: 10, lineCap: 'butt', size: 'lg', formatValue: (v: number, m: number) => `${v}/${m}` },
}

export const Indeterminate: Story = { args: { indeterminate: true } }

/** `<ProgressBar type="circle">`: the ring with label and description underneath. */
export const InProgressBar: Story = {
  render: () => ({
    components: { ProgressBar },
    setup() {
      const value = ref(0)
      const timer = setInterval(() => (value.value = value.value >= 100 ? 0 : value.value + 5), 300)
      onBeforeUnmount(() => clearInterval(timer))
      return { value }
    },
    template: `
      <ProgressBar
        type="circle"
        size="lg"
        label="report.pdf"
        :value="value"
        :variant="value >= 100 ? 'success' : 'default'"
        :description="value >= 100 ? 'Done' : 'Uploading…'"
      />
    `,
  }),
}
