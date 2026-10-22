import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const meta = {
  title: "UI/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="dlg-name">Name</FieldLabel>
            <Input id="dlg-name" defaultValue="Jane Doe" />
          </Field>
          <Field>
            <FieldLabel htmlFor="dlg-username">Username</FieldLabel>
            <Input id="dlg-username" defaultValue="@janedoe" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opened by default</DialogTitle>
          <DialogDescription>Useful for reviewing the dialog layout without clicking.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms of service</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
        </DialogHeader>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
        <DialogFooter showCloseButton>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
