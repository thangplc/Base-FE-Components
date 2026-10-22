import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '.'

const components = {
  Button, Field, FieldGroup, FieldLabel, Input,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
}

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Dialog>
        <DialogTrigger as-child><Button variant="outline">Edit profile</Button></DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel for="dlg-name">Name</FieldLabel>
              <Input id="dlg-name" default-value="Jane Doe" />
            </Field>
            <Field>
              <FieldLabel for="dlg-username">Username</FieldLabel>
              <Input id="dlg-username" default-value="@janedoe" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
}

export const Open: Story = {
  render: () => ({
    components,
    template: `
      <Dialog default-open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opened by default</DialogTitle>
            <DialogDescription>Useful for reviewing the dialog layout without clicking.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    `,
  }),
}

export const LongContent: Story = {
  render: () => ({
    components,
    template: `
      <Dialog>
        <DialogTrigger as-child><Button variant="outline">Terms of service</Button></DialogTrigger>
        <DialogContent class="max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Terms of service</DialogTitle></DialogHeader>
          <p v-for="i in 12" :key="i" class="text-sm text-muted-foreground">
            Section {{ i }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <DialogFooter show-close-button><Button>Accept</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
}
