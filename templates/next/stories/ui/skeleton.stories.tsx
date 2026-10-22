import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  ),
}

export const CardPlaceholder: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  ),
}
