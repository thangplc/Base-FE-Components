import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "./button"
import { Field, FieldGroup, FieldLabel } from "./field"
import { Input } from "./input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover"

const meta = {
  title: "UI/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="pop-width" className="w-1/2">Width</FieldLabel>
            <Input id="pop-width" defaultValue="100%" className="h-8" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="pop-height" className="w-1/2">Height</FieldLabel>
            <Input id="pop-height" defaultValue="25px" className="h-8" />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-2">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="capitalize">{align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align} className="w-48 text-sm">Aligned to {align}.</PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
