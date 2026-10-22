import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="flex items-center gap-4">
        <Skeleton class="size-12 rounded-full" />
        <div class="flex flex-col gap-2">
          <Skeleton class="h-4 w-60" />
          <Skeleton class="h-4 w-48" />
        </div>
      </div>
    `,
  }),
}

export const CardPlaceholder: Story = {
  render: () => ({
    components: { Skeleton, Card, CardContent, CardHeader },
    template: `
      <Card class="w-80">
        <CardHeader>
          <Skeleton class="h-4 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent><Skeleton class="aspect-video w-full" /></CardContent>
      </Card>
    `,
  }),
}
