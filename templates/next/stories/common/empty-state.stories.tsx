import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlusIcon, SearchXIcon, WifiOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"

const meta = {
  title: "Common/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    title: "No projects yet",
    description: "Create your first project to get started.",
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAction: Story = {
  args: {
    action: (
      <Button>
        <PlusIcon data-icon="inline-start" />
        Create project
      </Button>
    ),
  },
}

export const NoSearchResults: Story = {
  args: {
    icon: <SearchXIcon />,
    title: "No results found",
    description: "Try a different keyword or clear the filters.",
    action: <Button variant="outline">Clear filters</Button>,
  },
}

export const Offline: Story = {
  args: {
    icon: <WifiOffIcon />,
    title: "You are offline",
    description: "Check your connection and try again.",
    action: <Button variant="outline">Retry</Button>,
    className: "border border-dashed",
  },
}
