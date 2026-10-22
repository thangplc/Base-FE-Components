import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '.'

const meta = {
  title: 'UI/Label',
  component: Label,
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Label, Checkbox },
    template: `
      <div class="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label for="terms">Accept terms and conditions</Label>
      </div>
    `,
  }),
}
