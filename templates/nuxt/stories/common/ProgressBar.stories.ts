import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const meta = {
  title: 'Common/ProgressBar',
  component: ProgressBar,
  args: { label: 'Uploading', value: 42, description: '5 of 12 files' },
  render: args => ({
    components: { ProgressBar },
    setup: () => ({ args }),
    template: '<div class="w-80"><ProgressBar v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomValue: Story = {
  args: {
    label: 'Storage',
    value: 7.4,
    max: 10,
    formatValue: (value: number, max: number) => `${value} / ${max} GB`,
    variant: 'warning',
    description: 'Upgrade to get more space.',
  },
}

export const Indeterminate: Story = {
  args: { label: 'Preparing export…', indeterminate: true, description: undefined },
}

export const Animated: Story = {
  render: () => ({
    components: { ProgressBar },
    setup() {
      const value = ref(0)
      const timer = setInterval(() => (value.value = value.value >= 100 ? 0 : value.value + 5), 300)
      onBeforeUnmount(() => clearInterval(timer))
      return { value }
    },
    template: `
      <div class="w-80">
        <ProgressBar
          label="report.pdf"
          :value="value"
          :variant="value >= 100 ? 'success' : 'default'"
          :description="value >= 100 ? 'Done' : 'Uploading…'"
        />
      </div>
    `,
  }),
}
