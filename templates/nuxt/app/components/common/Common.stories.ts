import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog.vue'
import EmptyState from './EmptyState.vue'
import PageHeader from './PageHeader.vue'

const meta = {
  title: 'Common/Overview',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PageHeaderStory: Story = {
  name: 'PageHeader',
  render: () => ({
    components: { PageHeader, Button, PlusIcon },
    template: `
      <PageHeader title="Projects" description="Manage all projects in your workspace.">
        <template #actions>
          <Button><PlusIcon data-icon="inline-start" />New project</Button>
        </template>
      </PageHeader>
    `,
  }),
}

export const EmptyStateStory: Story = {
  name: 'EmptyState',
  render: () => ({
    components: { EmptyState, Button },
    template: `
      <EmptyState title="No projects yet" description="Create your first project to get started.">
        <template #action><Button>Create project</Button></template>
      </EmptyState>
    `,
  }),
}

export const ConfirmDialogStory: Story = {
  name: 'ConfirmDialog',
  render: () => ({
    components: { ConfirmDialog, Button, Trash2Icon },
    setup: () => ({
      async onConfirm() {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Deleted')
      },
    }),
    template: `
      <ConfirmDialog
        title="Delete this item?"
        description="The dialog stays open with a spinner until onConfirm resolves."
        confirm-text="Delete"
        variant="destructive"
        :on-confirm="onConfirm"
      >
        <template #trigger>
          <Button variant="destructive"><Trash2Icon data-icon="inline-start" />Delete</Button>
        </template>
      </ConfirmDialog>
    `,
  }),
}
