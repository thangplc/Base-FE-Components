import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Progress } from '@/components/ui/progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  args: { modelValue: 60 },
  argTypes: {
    modelValue: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'destructive'] },
    indeterminate: { control: 'boolean' },
  },
  render: args => ({
    components: { Progress },
    setup: () => ({ args }),
    template: '<div class="w-80"><Progress v-bind="args" /></div>',
  }),
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="flex w-80 flex-col gap-4">
        <Progress size="sm" :model-value="30" />
        <Progress :model-value="50" />
        <Progress size="lg" :model-value="70" />
      </div>
    `,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="flex w-80 flex-col gap-4">
        <Progress :model-value="40" />
        <Progress variant="success" :model-value="100" />
        <Progress variant="warning" :model-value="85" />
        <Progress variant="destructive" :model-value="95" />
      </div>
    `,
  }),
}

/** Unknown duration: a bar sliding back and forth. */
export const Indeterminate: Story = { args: { indeterminate: true } }
