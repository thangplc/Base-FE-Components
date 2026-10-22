import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StepItem } from '@/components/common/Stepper.vue'
import { CreditCardIcon, PackageIcon, TruckIcon, UserIcon } from '@lucide/vue'
import { ref } from 'vue'
import Stepper from '@/components/common/Stepper.vue'
import { Button } from '@/components/ui/button'

const checkout: StepItem[] = [
  { title: 'Account', description: 'Your details', icon: UserIcon },
  { title: 'Shipping', description: 'Where to send it', icon: TruckIcon },
  { title: 'Payment', description: 'Card or bank', icon: CreditCardIcon },
  { title: 'Review', description: 'Confirm the order', icon: PackageIcon },
]

const meta = {
  title: 'Common/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  args: { steps: checkout, current: 1 },
  argTypes: {
    current: { control: { type: 'range', min: 0, max: 4 } },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: args => ({
    components: { Stepper },
    setup: () => ({ args }),
    template: '<Stepper v-bind="args" />',
  }),
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Numbers: Story = {
  args: { steps: checkout.map(step => ({ ...step, icon: undefined })), current: 2 },
}

export const Vertical: Story = { args: { orientation: 'vertical', current: 2 } }

export const WithError: Story = {
  args: {
    current: 3,
    steps: checkout.map(step =>
      step.title === 'Payment' ? { ...step, status: 'error' as const, description: 'Card was declined' } : step,
    ),
  },
}

/** Next / Back buttons; click a completed step to jump back. */
export const Interactive: Story = {
  render: () => ({
    components: { Stepper, Button },
    setup: () => ({ steps: checkout, current: ref(0) }),
    template: `
      <div class="flex flex-col gap-6">
        <Stepper :steps="steps" :current="current" @step-click="(i) => (current = i)" />
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="current === 0" @click="current--">Back</Button>
          <Button :disabled="current === steps.length" @click="current++">
            {{ current >= steps.length - 1 ? 'Finish' : 'Next' }}
          </Button>
        </div>
      </div>
    `,
  }),
}
