import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DownloadIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

const meta = {
  title: "Common/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  args: {
    title: "Projects",
    description: "Manage all projects in your workspace.",
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TitleOnly: Story = { args: { description: undefined } }

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="outline">
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
        <Button>
          <PlusIcon data-icon="inline-start" />
          New project
        </Button>
      </>
    ),
  },
}
