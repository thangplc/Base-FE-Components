import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect, useState } from "react"

import { ProgressBar } from "@/components/common/progress-bar"

const meta = {
  title: "Common/ProgressBar",
  component: ProgressBar,
  args: { label: "Uploading", value: 42, description: "5 of 12 files" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomValue: Story = {
  args: {
    label: "Storage",
    value: 7.4,
    max: 10,
    formatValue: (value: number, max: number) => `${value} / ${max} GB`,
    variant: "warning",
    description: "Upgrade to get more space.",
  },
}

export const Indeterminate: Story = {
  args: { label: "Preparing export…", indeterminate: true, description: undefined },
}

function UploadDemo() {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 300)
    return () => clearInterval(timer)
  }, [])
  return (
    <ProgressBar
      label="report.pdf"
      value={value}
      variant={value >= 100 ? "success" : "default"}
      description={value >= 100 ? "Done" : "Uploading…"}
    />
  )
}

export const Animated: Story = { render: () => <UploadDemo /> }
