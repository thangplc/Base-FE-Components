import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { CalculatorIcon, CalendarIcon, SettingsIcon, SmileIcon, UserIcon } from "lucide-react"

import { Button } from "./button"
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
} from "./command"

const meta = {
  title: "UI/Command",
  component: Command,
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

function Items() {
  return (
    <>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem><CalendarIcon /> Calendar</CommandItem>
        <CommandItem><SmileIcon /> Search emoji</CommandItem>
        <CommandItem disabled><CalculatorIcon /> Calculator</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem><UserIcon /> Profile <CommandShortcut>⌘P</CommandShortcut></CommandItem>
        <CommandItem><SettingsIcon /> Settings <CommandShortcut>⌘S</CommandShortcut></CommandItem>
      </CommandGroup>
    </>
  )
}

export const Default: Story = {
  render: () => (
    <Command className="w-96 rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <Items />
      </CommandList>
    </Command>
  ),
}

function DialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <Items />
        </CommandList>
      </CommandDialog>
    </>
  )
}

export const Dialog: Story = { render: () => <DialogDemo /> }
