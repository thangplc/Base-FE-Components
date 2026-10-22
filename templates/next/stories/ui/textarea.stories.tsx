import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  args: { placeholder: "Type your message here." },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }

export const Invalid: Story = { args: { "aria-invalid": true } }
