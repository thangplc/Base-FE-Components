import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "./confirm-dialog"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"

const meta = {
  title: "Common/Overview",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PageHeaderStory: Story = {
  name: "PageHeader",
  render: () => (
    <PageHeader
      title="Projects"
      description="Manage all projects in your workspace."
      actions={
        <Button>
          <PlusIcon data-icon="inline-start" />
          New project
        </Button>
      }
    />
  ),
}

export const EmptyStateStory: Story = {
  name: "EmptyState",
  render: () => (
    <EmptyState
      title="No projects yet"
      description="Create your first project to get started."
      action={<Button>Create project</Button>}
    />
  ),
}

export const ConfirmDialogStory: Story = {
  name: "ConfirmDialog",
  render: () => (
    <ConfirmDialog
      trigger={
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
      }
      title="Delete this item?"
      description="The dialog stays open with a spinner until onConfirm resolves."
      confirmText="Delete"
      variant="destructive"
      onConfirm={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast.success("Deleted")
      }}
    />
  ),
}
