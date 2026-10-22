import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CalculatorIcon, CalendarIcon, SettingsIcon, SmileIcon, UserIcon } from '@lucide/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '.'

const components = {
  Button, CalculatorIcon, CalendarIcon, SettingsIcon, SmileIcon, UserIcon,
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  CommandSeparator, CommandShortcut,
}

const items = `
  <CommandEmpty>No results found.</CommandEmpty>
  <CommandGroup heading="Suggestions">
    <CommandItem value="calendar"><CalendarIcon /> Calendar</CommandItem>
    <CommandItem value="emoji"><SmileIcon /> Search emoji</CommandItem>
    <CommandItem value="calculator" disabled><CalculatorIcon /> Calculator</CommandItem>
  </CommandGroup>
  <CommandSeparator />
  <CommandGroup heading="Settings">
    <CommandItem value="profile"><UserIcon /> Profile <CommandShortcut>⌘P</CommandShortcut></CommandItem>
    <CommandItem value="settings"><SettingsIcon /> Settings <CommandShortcut>⌘S</CommandShortcut></CommandItem>
  </CommandGroup>
`

const meta = {
  title: 'UI/Command',
  component: Command,
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Command class="w-96 rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>${items}</CommandList>
      </Command>
    `,
  }),
}

export const Dialog: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <Button variant="outline" @click="open = true">Open command palette</Button>
      <CommandDialog v-model:open="open">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>${items}</CommandList>
      </CommandDialog>
    `,
  }),
}
