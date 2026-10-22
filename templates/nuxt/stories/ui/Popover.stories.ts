import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'

const components = {
  Button, Field, FieldGroup, FieldLabel, Input,
  Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger,
}

const meta = {
  title: 'UI/Popover',
  component: Popover,
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button variant="outline">Open popover</Button></PopoverTrigger>
        <PopoverContent class="w-80">
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </PopoverHeader>
          <FieldGroup class="gap-3">
            <Field orientation="horizontal">
              <FieldLabel for="pop-width" class="w-1/2">Width</FieldLabel>
              <Input id="pop-width" default-value="100%" class="h-8" />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel for="pop-height" class="w-1/2">Height</FieldLabel>
              <Input id="pop-height" default-value="25px" class="h-8" />
            </Field>
          </FieldGroup>
        </PopoverContent>
      </Popover>
    `,
  }),
}

export const Alignment: Story = {
  render: () => ({
    components,
    setup: () => ({ aligns: ['start', 'center', 'end'] }),
    template: `
      <div class="flex gap-2">
        <Popover v-for="align in aligns" :key="align">
          <PopoverTrigger as-child><Button variant="outline" class="capitalize">{{ align }}</Button></PopoverTrigger>
          <PopoverContent :align="align" class="w-48 text-sm">Aligned to {{ align }}.</PopoverContent>
        </Popover>
      </div>
    `,
  }),
}
