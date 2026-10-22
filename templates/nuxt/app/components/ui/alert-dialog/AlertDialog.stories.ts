import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Trash2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '.'

const components = {
  Button, Trash2Icon,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger,
}

const meta = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  parameters: {
    docs: {
      description: { component: 'Low-level parts. Prefer Common/ConfirmDialog, which also handles async confirm.' },
    },
  },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <AlertDialog>
        <AlertDialogTrigger as-child><Button variant="outline">Show dialog</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
  }),
}

export const DestructiveWithMedia: Story = {
  render: () => ({
    components,
    template: `
      <AlertDialog>
        <AlertDialogTrigger as-child><Button variant="destructive">Delete project</Button></AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia class="bg-destructive/10 text-destructive"><Trash2Icon /></AlertDialogMedia>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>All files in this project will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
  }),
}
