import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">My account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon /> Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon /> Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem disabled>API (coming soon)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

function CheckboxesDemo() {
  const [status, setStatus] = useState(true)
  const [activity, setActivity] = useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={status} onCheckedChange={setStatus}>
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={activity} onCheckedChange={setActivity}>
          Activity bar
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Checkboxes: Story = { render: () => <CheckboxesDemo /> }

function RadioDemo() {
  const [position, setPosition] = useState("bottom")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Panel: {position}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const RadioGroup: Story = { render: () => <RadioDemo /> }
