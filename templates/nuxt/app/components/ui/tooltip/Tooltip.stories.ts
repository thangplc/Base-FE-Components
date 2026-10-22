import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '.'

const components = { Button, PlusIcon, Tooltip, TooltipContent, TooltipTrigger }

/** Needs a `<TooltipProvider>` ancestor (SidebarProvider already includes one). */
const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" aria-label="Add"><PlusIcon /></Button>
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    `,
  }),
}

export const Sides: Story = {
  render: () => ({
    components,
    setup: () => ({ sides: ['top', 'right', 'bottom', 'left'] }),
    template: `
      <div class="flex gap-2">
        <Tooltip v-for="side in sides" :key="side">
          <TooltipTrigger as-child><Button variant="outline" class="capitalize">{{ side }}</Button></TooltipTrigger>
          <TooltipContent :side="side">Tooltip on {{ side }}</TooltipContent>
        </Tooltip>
      </div>
    `,
  }),
}

export const AlwaysOpen: Story = {
  render: () => ({
    components,
    template: `
      <Tooltip :open="true">
        <TooltipTrigger as-child><Button variant="outline">Hover me</Button></TooltipTrigger>
        <TooltipContent>Forced open for visual review</TooltipContent>
      </Tooltip>
    `,
  }),
}
