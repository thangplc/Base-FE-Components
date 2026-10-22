import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Label",
  component: Label,
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
