import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Needs `<TooltipProvider>` once at the root (already in providers.tsx). */
const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" className="capitalize">{side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

export const AlwaysOpen: Story = {
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Forced open for visual review</TooltipContent>
    </Tooltip>
  ),
}
