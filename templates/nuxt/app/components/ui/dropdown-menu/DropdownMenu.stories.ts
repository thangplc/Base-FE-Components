import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from '@lucide/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
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
} from '.'

const components = {
  Button, CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
}

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child><Button variant="outline">My account</Button></DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="start">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem><UserIcon /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem><CreditCardIcon /> Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem><SettingsIcon /> Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
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
          <DropdownMenuItem variant="destructive"><LogOutIcon /> Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}

export const Checkboxes: Story = {
  render: () => ({
    components,
    setup: () => ({ status: ref(true), activity: ref(false) }),
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child><Button variant="outline">View</Button></DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem v-model="status">Status bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="activity">Activity bar</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}

export const RadioGroup: Story = {
  render: () => ({
    components,
    setup: () => ({ position: ref('bottom') }),
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child><Button variant="outline">Panel: {{ position }}</Button></DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Panel position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup v-model="position">
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}
