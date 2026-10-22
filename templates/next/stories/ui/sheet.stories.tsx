import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const meta = {
  title: "UI/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here.</SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <FieldLabel htmlFor="sheet-name">Name</FieldLabel>
            <Input id="sheet-name" defaultValue="Jane Doe" />
          </Field>
          <Field>
            <FieldLabel htmlFor="sheet-email">Email</FieldLabel>
            <Input id="sheet-email" defaultValue="jane@example.com" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} sheet</SheetTitle>
              <SheetDescription>Slides in from the {side}.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/**
 * `overlay` on SheetContent: "blur" (default), "dim" or "none". With
 * `modal={false}` on Sheet there is no overlay and the page stays usable.
 */
export const Overlay: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["blur", "dim", "none"] as const).map((overlay) => (
        <Sheet key={overlay}>
          <SheetTrigger asChild>
            <Button variant="outline">overlay=&quot;{overlay}&quot;</Button>
          </SheetTrigger>
          <SheetContent overlay={overlay}>
            <SheetHeader>
              <SheetTitle>overlay=&quot;{overlay}&quot;</SheetTitle>
              <SheetDescription>Click outside to close.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
      <Sheet modal={false}>
        <SheetTrigger asChild>
          <Button variant="outline">modal=&#123;false&#125;</Button>
        </SheetTrigger>
        <SheetContent onInteractOutside={(event) => event.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Non-modal</SheetTitle>
            <SheetDescription>
              The page behind stays clickable and scrollable; outside clicks don&apos;t close it
              (onInteractOutside prevents that). Use the × to close.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}
