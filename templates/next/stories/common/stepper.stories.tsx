import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { CreditCardIcon, PackageIcon, TruckIcon, UserIcon } from "lucide-react"

import { Stepper, type StepItem } from "@/components/common/stepper"
import { Button } from "@/components/ui/button"

const checkout: StepItem[] = [
  { title: "Account", description: "Your details", icon: UserIcon },
  { title: "Shipping", description: "Where to send it", icon: TruckIcon },
  { title: "Payment", description: "Card or bank", icon: CreditCardIcon },
  { title: "Review", description: "Confirm the order", icon: PackageIcon },
]

const meta = {
  title: "Common/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  args: { steps: checkout, current: 1 },
  argTypes: {
    current: { control: { type: "range", min: 0, max: 4 } },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Numbers: Story = {
  args: { steps: checkout.map((step) => ({ ...step, icon: undefined })), current: 2 },
}

export const Vertical: Story = { args: { orientation: "vertical", current: 2 } }

export const WithError: Story = {
  args: {
    current: 3,
    steps: checkout.map((step) =>
      step.title === "Payment" ? { ...step, status: "error", description: "Card was declined" } : step
    ),
  },
}

function WizardDemo() {
  const [current, setCurrent] = useState(0)
  return (
    <div className="flex flex-col gap-6">
      {/* Completed steps are clickable to go back. */}
      <Stepper steps={checkout} current={current} onStepClick={setCurrent} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </Button>
        <Button disabled={current === checkout.length} onClick={() => setCurrent((c) => c + 1)}>
          {current >= checkout.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}

/** Next / Back buttons; click a completed step to jump back. */
export const Interactive: Story = { render: () => <WizardDemo /> }
