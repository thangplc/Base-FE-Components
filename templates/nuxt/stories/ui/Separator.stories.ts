import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Separator },
    template: `
      <div class="w-72">
        <div class="flex flex-col gap-1">
          <h4 class="text-sm font-medium">Starter Kit</h4>
          <p class="text-sm text-muted-foreground">Base components for every project.</p>
        </div>
        <Separator class="my-4" />
        <div class="flex h-5 items-center gap-4 text-sm">
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Source</span>
        </div>
      </div>
    `,
  }),
}
