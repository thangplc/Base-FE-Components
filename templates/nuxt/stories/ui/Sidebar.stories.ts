import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BoxIcon, ChevronRightIcon, FileTextIcon, HomeIcon, InboxIcon, PlusIcon, SettingsIcon } from '@lucide/vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const components = {
  BoxIcon, ChevronRightIcon, FileTextIcon, HomeIcon, InboxIcon, PlusIcon, SettingsIcon,
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
}

const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['sidebar', 'floating', 'inset'] },
    collapsible: { control: 'select', options: ['offcanvas', 'icon', 'none'] },
    side: { control: 'select', options: ['left', 'right'] },
  },
  args: { variant: 'sidebar', collapsible: 'icon', side: 'left' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => ({
    components,
    setup: () => ({ args }),
    template: `
      <SidebarProvider>
        <Sidebar v-bind="args">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <BoxIcon class="size-4" />
                  </div>
                  <span class="font-semibold">Acme Inc</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupAction title="Add project"><PlusIcon /></SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton is-active tooltip="Home"><HomeIcon /><span>Home</span></SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Inbox"><InboxIcon /><span>Inbox</span></SidebarMenuButton>
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Docs"><FileTextIcon /><span>Docs</span><ChevronRightIcon class="ml-auto" /></SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem><SidebarMenuSubButton href="#">Introduction</SidebarMenuSubButton></SidebarMenuSubItem>
                      <SidebarMenuSubItem><SidebarMenuSubButton href="#" is-active>Installation</SidebarMenuSubButton></SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Loading state</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem v-for="i in 3" :key="i"><SidebarMenuSkeleton show-icon /></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings"><SettingsIcon /><span>Settings</span></SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header class="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span class="text-sm text-muted-foreground">Toggle with the button or Ctrl/⌘ + B</span>
          </header>
          <div class="p-6 text-sm text-muted-foreground">Page content</div>
        </SidebarInset>
      </SidebarProvider>
    `,
  }),
}
