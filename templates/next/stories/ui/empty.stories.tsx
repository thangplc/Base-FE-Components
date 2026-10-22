import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FolderOpenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const meta = {
  title: "UI/Empty",
  component: Empty,
  parameters: {
    docs: {
      description: { component: "Low-level parts. Prefer Common/EmptyState for the usual case." },
    },
  },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty className="w-[28rem] border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No files</EmptyTitle>
        <EmptyDescription>Upload a file or import from another project.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Upload</Button>
          <Button variant="outline">Import</Button>
        </div>
      </EmptyContent>
    </Empty>
  ),
}
