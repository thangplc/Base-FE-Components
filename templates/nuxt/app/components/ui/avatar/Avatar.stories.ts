import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '.'

const components = { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  argTypes: { size: { control: 'select', options: ['sm', 'default', 'lg'] } },
  render: args => ({
    components,
    setup: () => ({ args }),
    template: `
      <Avatar v-bind="args">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    `,
  }),
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components,
    template: `
      <div class="flex items-center gap-3">
        <Avatar v-for="size in ['sm', 'default', 'lg']" :key="size" :size="size">
          <AvatarFallback>{{ size.slice(0, 2).toUpperCase() }}</AvatarFallback>
        </Avatar>
      </div>
    `,
  }),
}

export const Fallback: Story = {
  render: () => ({
    components,
    template: `
      <Avatar>
        <AvatarImage src="/broken-image.png" alt="Broken" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    `,
  }),
}

export const WithBadge: Story = {
  render: () => ({
    components,
    template: `
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge class="bg-success" />
      </Avatar>
    `,
  }),
}

export const Group: Story = {
  render: () => ({
    components,
    template: `
      <AvatarGroup>
        <Avatar v-for="initials in ['AN', 'BT', 'CL']" :key="initials">
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    `,
  }),
}
