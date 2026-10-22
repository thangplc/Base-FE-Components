import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BadgeCheckIcon } from "lucide-react"

import { Badge } from "./badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Badge" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="secondary">
        <BadgeCheckIcon data-icon="inline-start" />
        Verified
      </Badge>
      <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">8</Badge>
    </div>
  ),
}

export const AsLink: Story = {
  render: () => (
    <Badge asChild>
      <a href="#">Link badge</a>
    </Badge>
  ),
}
