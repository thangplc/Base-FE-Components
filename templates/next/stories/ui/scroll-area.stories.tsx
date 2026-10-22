import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const tags = Array.from({ length: 40 }, (_, i) => `v1.2.0-beta.${40 - i}`)

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex h-32 w-40 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}
