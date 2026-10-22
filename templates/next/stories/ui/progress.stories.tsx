import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Progress } from "@/components/ui/progress"

const meta = {
  title: "UI/Progress",
  component: Progress,
  args: { value: 60 },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    variant: { control: "select", options: ["default", "success", "warning", "destructive"] },
    indeterminate: { control: "boolean" },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Progress size="sm" value={30} />
      <Progress value={50} />
      <Progress size="lg" value={70} />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Progress value={40} />
      <Progress variant="success" value={100} />
      <Progress variant="warning" value={85} />
      <Progress variant="destructive" value={95} />
    </div>
  ),
}

/** Unknown duration: a bar sliding back and forth. */
export const Indeterminate: Story = { args: { indeterminate: true } }
