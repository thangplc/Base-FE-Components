import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({ components: { Spinner }, template: '<Spinner />' }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center gap-4">
        <Spinner class="size-3" />
        <Spinner />
        <Spinner class="size-6" />
        <Spinner class="size-8 text-muted-foreground" />
      </div>
    `,
  }),
}

export const InButtonAndBadge: Story = {
  render: () => ({
    components: { Spinner, Button, Badge },
    template: `
      <div class="flex items-center gap-2">
        <Button disabled><Spinner data-icon="inline-start" />Loading...</Button>
        <Button variant="outline" disabled><Spinner data-icon="inline-start" />Please wait</Button>
        <Badge variant="secondary"><Spinner data-icon="inline-start" />Syncing</Badge>
      </div>
    `,
  }),
}
