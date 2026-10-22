import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  decorators: [() => ({ template: '<div class="w-80"><story /></div>' })],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Textarea },
    template: '<Textarea placeholder="Type your message here." />',
  }),
}

export const States: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-3">
        <Textarea placeholder="Disabled" disabled />
        <Textarea placeholder="Invalid" aria-invalid="true" />
      </div>
    `,
  }),
}
