import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const meta = {
  title: "UI/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  ),
}

export const InButtonAndBadge: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button disabled>
        <Spinner data-icon="inline-start" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <Spinner data-icon="inline-start" />
        Please wait
      </Button>
      <Badge variant="secondary">
        <Spinner data-icon="inline-start" />
        Syncing
      </Badge>
    </div>
  ),
}
