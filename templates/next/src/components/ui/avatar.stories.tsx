import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  argTypes: { size: { control: "select", options: ["sm", "default", "lg"] } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>{size.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.png" alt="Broken" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
      <AvatarBadge className="bg-success" />
    </Avatar>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {["AN", "BT", "CL"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
}
