import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect, useState } from "react"
import { CheckIcon } from "lucide-react"

import { ProgressBar } from "@/components/common/progress-bar"
import { ProgressCircle } from "@/components/common/progress-circle"

/** SVG ring: value in the middle, variants, sizes, a gauge gap and an indeterminate spin. */
const meta = {
  title: "Common/ProgressCircle",
  component: ProgressCircle,
  args: { value: 42 },
} satisfies Meta<typeof ProgressCircle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ProgressCircle {...args} size="sm" />
      <ProgressCircle {...args} />
      <ProgressCircle {...args} size="lg" />
      <ProgressCircle {...args} size={128} strokeWidth={10} />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ProgressCircle value={42} />
      <ProgressCircle value={100} variant="success">
        <CheckIcon className="size-6 text-success" />
      </ProgressCircle>
      <ProgressCircle value={75} variant="warning" />
      <ProgressCircle value={90} variant="destructive" />
    </div>
  ),
}

/** `gapDegree={75}`: a gauge open at the bottom. */
export const Dashboard: Story = { args: { value: 68, size: "lg", gapDegree: 75 } }

/** `lineCap="butt"` for square ends; `formatValue` for any text. */
export const CustomValue: Story = {
  args: { value: 7.4, max: 10, lineCap: "butt", size: "lg", formatValue: (v: number, m: number) => `${v}/${m}` },
}

export const Indeterminate: Story = { args: { indeterminate: true } }

function UploadDemo() {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 300)
    return () => clearInterval(timer)
  }, [])
  return (
    <ProgressBar
      type="circle"
      size="lg"
      label="report.pdf"
      value={value}
      variant={value >= 100 ? "success" : "default"}
      description={value >= 100 ? "Done" : "Uploading…"}
    />
  )
}

/** `<ProgressBar type="circle">`: the ring with label and description underneath. */
export const InProgressBar: Story = { render: () => <UploadDemo /> }
