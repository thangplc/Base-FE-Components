import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '.'

const components = { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }

const meta = {
  title: 'UI/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Select>
        <SelectTrigger class="w-48"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes" disabled>Grapes</SelectItem>
        </SelectContent>
      </Select>
    `,
  }),
}

export const Grouped: Story = {
  render: () => ({
    components,
    template: `
      <Select default-value="est">
        <SelectTrigger class="w-64"><SelectValue placeholder="Select a timezone" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            <SelectItem value="est">Eastern Time (EST)</SelectItem>
            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Asia</SelectLabel>
            <SelectItem value="ict">Indochina Time (ICT)</SelectItem>
            <SelectItem value="jst">Japan Time (JST)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    `,
  }),
}

export const SizesAndStates: Story = {
  render: () => ({
    components,
    template: `
      <div class="flex flex-col gap-3">
        <Select>
          <SelectTrigger size="sm" class="w-48"><SelectValue placeholder="Small" /></SelectTrigger>
          <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger class="w-48"><SelectValue placeholder="Disabled" /></SelectTrigger>
          <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
        </Select>
        <Select>
          <SelectTrigger aria-invalid="true" class="w-48"><SelectValue placeholder="Invalid" /></SelectTrigger>
          <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
        </Select>
      </div>
    `,
  }),
}
