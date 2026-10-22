import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Separator } from "@/components/ui/separator"

const meta = {
  title: "UI/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium">Starter Kit</h4>
        <p className="text-sm text-muted-foreground">Base components for every project.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  ),
}
