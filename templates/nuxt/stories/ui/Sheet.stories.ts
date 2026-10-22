import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const components = {
  Button, Field, FieldGroup, FieldLabel, Input,
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
}

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Sheet>
        <SheetTrigger as-child><Button variant="outline">Open sheet</Button></SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Make changes to your profile here.</SheetDescription>
          </SheetHeader>
          <FieldGroup class="px-4">
            <Field>
              <FieldLabel for="sheet-name">Name</FieldLabel>
              <Input id="sheet-name" default-value="Jane Doe" />
            </Field>
            <Field>
              <FieldLabel for="sheet-email">Email</FieldLabel>
              <Input id="sheet-email" default-value="jane@example.com" />
            </Field>
          </FieldGroup>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose as-child><Button variant="outline">Close</Button></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    `,
  }),
}

export const Sides: Story = {
  render: () => ({
    components,
    setup: () => ({ sides: ['top', 'right', 'bottom', 'left'] }),
    template: `
      <div class="grid grid-cols-2 gap-2">
        <Sheet v-for="side in sides" :key="side">
          <SheetTrigger as-child><Button variant="outline" class="capitalize">{{ side }}</Button></SheetTrigger>
          <SheetContent :side="side">
            <SheetHeader>
              <SheetTitle class="capitalize">{{ side }} sheet</SheetTitle>
              <SheetDescription>Slides in from the {{ side }}.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    `,
  }),
}
