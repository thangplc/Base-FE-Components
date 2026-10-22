import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ArrowRightIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args}>Default</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Button {...args}>
        <PlusIcon data-icon="inline-start" />
        Create
      </Button>
      <Button {...args} variant="outline">
        Next
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button {...args} size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
    </div>
  ),
}
