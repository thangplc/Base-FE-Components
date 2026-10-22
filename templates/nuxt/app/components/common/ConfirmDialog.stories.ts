import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LogOutIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog.vue'

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const meta = {
  title: 'Common/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    onConfirm: () => {
      toast.success('Confirmed')
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
  },
  render: args => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ args }),
    template: `
      <ConfirmDialog v-bind="args">
        <template #trigger><Button variant="outline">Open</Button></template>
      </ConfirmDialog>
    `,
  }),
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: {
    title: 'Delete this project?',
    description: 'All files and settings will be permanently removed.',
    confirmText: 'Delete',
    variant: 'destructive',
  },
  render: args => ({
    components: { ConfirmDialog, Button, Trash2Icon },
    setup: () => ({ args }),
    template: `
      <ConfirmDialog v-bind="args">
        <template #trigger>
          <Button variant="destructive"><Trash2Icon data-icon="inline-start" />Delete project</Button>
        </template>
      </ConfirmDialog>
    `,
  }),
}

/** onConfirm returns a promise: buttons are disabled and a spinner shows until it resolves. */
export const AsyncConfirm: Story = {
  args: {
    title: 'Sign out of all devices?',
    confirmText: 'Sign out',
    onConfirm: async () => {
      await wait(1500)
      toast.success('Signed out')
    },
  },
  render: args => ({
    components: { ConfirmDialog, Button, LogOutIcon },
    setup: () => ({ args }),
    template: `
      <ConfirmDialog v-bind="args">
        <template #trigger>
          <Button variant="outline"><LogOutIcon data-icon="inline-start" />Sign out</Button>
        </template>
      </ConfirmDialog>
    `,
  }),
}

/** If onConfirm throws, the dialog stays open so the user can retry. */
export const FailingConfirm: Story = {
  args: {
    title: 'Retry payment?',
    confirmText: 'Retry',
    onConfirm: async () => {
      await wait(1000)
      toast.error('Payment failed, try again')
      throw new Error('Payment failed')
    },
  },
}
