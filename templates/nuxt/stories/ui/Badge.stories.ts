import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BadgeCheckIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
  },
  render: args => ({
    components: { Badge },
    setup: () => ({ args }),
    template: '<Badge v-bind="args">Badge</Badge>',
  }),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { Badge, BadgeCheckIcon },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="secondary"><BadgeCheckIcon data-icon="inline-start" />Verified</Badge>
        <Badge class="h-5 min-w-5 rounded-full px-1 tabular-nums">8</Badge>
      </div>
    `,
  }),
}

export const AsLink: Story = {
  render: () => ({
    components: { Badge },
    template: '<Badge as-child><a href="#">Link badge</a></Badge>',
  }),
}
